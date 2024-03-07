/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/naming-convention */
import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { TokenBridge } from 'tokenBridge';
import { BridgeConfiguration } from 'config';
import { ETH_SEPOLIA_TO_ZKEVM_TESTNET } from 'constants/bridges';
import {
  BridgeFeeActions, BridgeTxRequest, BridgeTxResponse, StatusResponse,
} from 'types';
import { ethers } from 'ethers';
import { BridgeError, BridgeErrorType } from 'errors';
import { GMPStatus, GasPaidStatus } from 'types/axelar';
import { queryTransactionStatus } from 'lib/gmpRecovery';

jest.mock('axios', () => ({
  post: jest.fn().mockReturnValue({
    data: '100000000',
  }),
}));

jest.mock('lib/gmpRecovery');

describe('Token Bridge', () => {
  it('Constructor works correctly', async () => {
    const voidRootProvider = new ethers.providers.JsonRpcProvider('x');
    const voidChildProvider = new ethers.providers.JsonRpcProvider('x');

    const bridgeConfig = new BridgeConfiguration({
      baseConfig: new ImmutableConfiguration({
        environment: Environment.SANDBOX,
      }),
      bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_TESTNET,
      rootProvider: voidRootProvider,
      childProvider: voidChildProvider,
    });

    // to work around using new for side-effects
    const bridge = new TokenBridge(bridgeConfig);
    expect(bridge).toBeDefined();
  });

  describe('getUnsignedApproveBridgeTx', () => {
    let tokenBridge: TokenBridge;
    const mockERC20Contract = {
      allowance: jest.fn(),
      interface: {
        encodeFunctionData: jest.fn(),
      },
    };

    const originalValidateDepositArgs = TokenBridge.prototype['validateDepositArgs'];
    const originalValidateChainConfiguration = TokenBridge.prototype['validateChainConfiguration'];

    beforeEach(() => {
      const voidRootProvider = new ethers.providers.JsonRpcProvider('x');
      const voidChildProvider = new ethers.providers.JsonRpcProvider('x');
      const bridgeConfig = new BridgeConfiguration({
        baseConfig: new ImmutableConfiguration({
          environment: Environment.SANDBOX,
        }),
        bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_TESTNET,
        rootProvider: voidRootProvider,
        childProvider: voidChildProvider,
      });
      jest.spyOn(ethers, 'Contract').mockReturnValue(mockERC20Contract as any);
      jest.spyOn(TokenBridge.prototype as any, 'validateChainConfiguration')
        .mockImplementation(async () => 'Valid');
      jest.spyOn(TokenBridge.prototype as any, 'validateDepositArgs')
        .mockImplementation(async () => 'Valid');
      tokenBridge = new TokenBridge(bridgeConfig);
    });

    afterEach(() => {
      jest.clearAllMocks();
      TokenBridge.prototype['validateDepositArgs'] = originalValidateDepositArgs;
      TokenBridge.prototype['validateChainConfiguration'] = originalValidateChainConfiguration;
    });
    it('returns the unsigned approval transaction when allowance is less than deposit amount', async () => {
      expect.assertions(5);
      const allowance = ethers.utils.parseUnits('50', 18);
      const amount = ethers.utils.parseUnits('100', 18);

      mockERC20Contract.allowance.mockResolvedValue(allowance);
      mockERC20Contract.interface.encodeFunctionData.mockResolvedValue('0xdata');

      const req = {
        senderAddress: '0x3095171469a0db24D9Fb9C789D62dF22BBAfa816',
        token: '0x2f14582947E292a2eCd20C430B46f2d27CFE213c',
        amount,
        sourceChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
        destinationChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
      };

      const result = await tokenBridge.getUnsignedApproveBridgeTx(req);

      expect(result.unsignedTx).toBeDefined();
      expect(result.unsignedTx?.data).toBe('0xdata');
      expect(result.unsignedTx?.to).toBe(req.token);
      expect(result.unsignedTx?.from).toBe(req.senderAddress);
      expect(result.unsignedTx?.value).toBe(0);
    });

    it('return null tx when the allowance is greater than the deposit amount', async () => {
      expect.assertions(1);
      const allowance = ethers.utils.parseUnits('200', 18);
      const amount = ethers.utils.parseUnits('100', 18);

      mockERC20Contract.allowance.mockResolvedValue(allowance);
      mockERC20Contract.interface.encodeFunctionData.mockResolvedValue('0xdata');

      const req = {
        senderAddress: '0x3095171469a0db24D9Fb9C789D62dF22BBAfa816',
        token: '0x2f14582947E292a2eCd20C430B46f2d27CFE213c',
        amount,
        sourceChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
        destinationChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
      };

      const result = await tokenBridge.getUnsignedApproveBridgeTx(req);
      expect(result.unsignedTx).toBeNull();
    });

    it('return null tx when the token is NATIVE', async () => {
      expect.assertions(1);
      const result = await tokenBridge.getUnsignedApproveBridgeTx(
        {
          token: 'NATIVE',
          senderAddress: '0x3095171469a0db24D9Fb9C789D62dF22BBAfa816',
          amount: ethers.utils.parseUnits('0.01', 18),
          sourceChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
          destinationChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
        },
      );
      expect(result.unsignedTx).toBeNull();
    });
  });

  describe('getUnsignedBridgeTx', () => {
    const originalValidateDepositArgs = TokenBridge.prototype['validateDepositArgs'];
    const originalValidateChainConfiguration = TokenBridge.prototype['validateChainConfiguration'];
    const originalGetFeePrivate = TokenBridge.prototype['getFeePrivate'];

    const sourceChainGas:ethers.BigNumber = ethers.utils.parseUnits('0.000001', 18);
    const destinationChainGas:ethers.BigNumber = ethers.utils.parseUnits('0.000001', 18);
    const bridgeFee:ethers.BigNumber = ethers.utils.parseUnits('0.0001', 18);
    const imtblFee:ethers.BigNumber = ethers.BigNumber.from(0);
    const totalFees:ethers.BigNumber = sourceChainGas.add(bridgeFee).add(imtblFee);

    let tokenBridge: TokenBridge;
    let bridgeConfig: BridgeConfiguration;
    beforeEach(() => {
      const mockRootProvider = {
        getNetwork: jest.fn().mockReturnValue({ chainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID }),
        getCode: jest.fn().mockReturnValue('0x'),
      } as unknown as ethers.providers.Web3Provider;
      const mockChildProvider = {
        getNetwork: jest.fn().mockReturnValue({ chainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID }),
        getCode: jest.fn().mockReturnValue('0x'),
      } as unknown as ethers.providers.Web3Provider;
      bridgeConfig = new BridgeConfiguration({
        baseConfig: new ImmutableConfiguration({
          environment: Environment.SANDBOX,
        }),
        bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_TESTNET,
        rootProvider: mockRootProvider,
        childProvider: mockChildProvider,
      });
      tokenBridge = new TokenBridge(bridgeConfig);
      jest.spyOn(TokenBridge.prototype as any, 'validateDepositArgs')
        .mockImplementation(async () => 'Valid');
      jest.spyOn(TokenBridge.prototype as any, 'validateChainConfiguration')
        .mockImplementation(async () => 'Valid');
      jest.spyOn(TokenBridge.prototype as any, 'getFeePrivate')
        .mockImplementation(async () => ({
          sourceChainGas,
          destinationChainGas,
          bridgeFee,
          imtblFee,
          totalFees,
        }));
    });
    afterEach(() => {
      jest.clearAllMocks();
      TokenBridge.prototype['validateDepositArgs'] = originalValidateDepositArgs;
      TokenBridge.prototype['validateChainConfiguration'] = originalValidateChainConfiguration;
      TokenBridge.prototype['getFeePrivate'] = originalGetFeePrivate;
    });

    it('ERC20 token with valid arguments is successful', async () => {
      expect.assertions(3);
      const recipientAddress = '0x3095171469a0db24D9Fb9C789D62dF22BBAfa816';
      const token = '0x2f14582947E292a2eCd20C430B46f2d27CFE213c';
      const amount = ethers.utils.parseUnits('0.01', 18);
      const request: BridgeTxRequest = {
        senderAddress: recipientAddress,
        recipientAddress,
        amount,
        token,
        sourceChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
        destinationChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
        gasMultiplier: 1.1,
      };
      const response: BridgeTxResponse = await tokenBridge.getUnsignedBridgeTx(request);

      expect(response.unsignedTx.to).toBe(
        bridgeConfig.bridgeContracts.rootERC20BridgeFlowRate,
      );
      expect(response.unsignedTx.value).toBe(ethers.utils.parseUnits('0.0001', 18).toString());
      expect(response.unsignedTx.data).not.toBeNull();
    });

    it('Native token with valid arguments is successful', async () => {
      expect.assertions(3);
      const recipientAddress = '0x3095171469a0db24D9Fb9C789D62dF22BBAfa816';
      const token = 'NATIVE';
      const amount = ethers.utils.parseUnits('0.01', 18);
      const request: BridgeTxRequest = {
        senderAddress: recipientAddress,
        recipientAddress,
        amount,
        token,
        sourceChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
        destinationChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
        gasMultiplier: 1.1,
      };

      const response: BridgeTxResponse = await tokenBridge.getUnsignedBridgeTx(request);
      expect(response.unsignedTx.to).toBe(bridgeConfig.bridgeContracts.rootERC20BridgeFlowRate);
      expect(response.unsignedTx.value).toBe(amount.add(ethers.utils.parseUnits('0.0001', 18)).toString());
      expect(response.unsignedTx.data).not.toBeNull();
    });

    it('ERC20 token with no-prefix addresses is successful', async () => {
      expect.assertions(3);
      const recipientAddress = '3095171469a0db24D9Fb9C789D62dF22BBAfa816';
      const token = '2f14582947E292a2eCd20C430B46f2d27CFE213c';
      const amount = ethers.utils.parseUnits('0.01', 18);
      const request: BridgeTxRequest = {
        senderAddress: recipientAddress,
        recipientAddress,
        amount,
        token,
        sourceChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
        destinationChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
        gasMultiplier: 1.1,
      };
      const response: BridgeTxResponse = await tokenBridge.getUnsignedBridgeTx(request);
      expect(response.unsignedTx.to).toBe(
        bridgeConfig.bridgeContracts.rootERC20BridgeFlowRate,
      );
      expect(response.unsignedTx.value).toBe(ethers.utils.parseUnits('0.0001', 18).toString());
      expect(response.unsignedTx.data).not.toBeNull();
    });
  });

  describe('validateDepositArgs ', () => {
    let tokenBridge: TokenBridge;

    const originalValidateChainIds = TokenBridge.prototype['validateChainIds'];

    beforeEach(() => {
      const voidRootProvider = new ethers.providers.JsonRpcProvider('x');
      const voidChildProvider = new ethers.providers.JsonRpcProvider('x');
      const bridgeConfig = new BridgeConfiguration({
        baseConfig: new ImmutableConfiguration({
          environment: Environment.SANDBOX,
        }),
        bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_TESTNET,
        rootProvider: voidRootProvider,
        childProvider: voidChildProvider,
      });
      jest.spyOn(TokenBridge.prototype as any, 'validateChainIds')
        .mockImplementation(async () => 'Valid');
      tokenBridge = new TokenBridge(bridgeConfig);
    });

    afterEach(() => {
      jest.clearAllMocks();
      TokenBridge.prototype['validateChainIds'] = originalValidateChainIds;
    });
    it('does not throw an error when everything setup correctly', async () => {
      expect.assertions(0);
      try {
        await tokenBridge['validateDepositArgs'](
          '0x1234567890123456789012345678901234567890',
          '0x1234567890123456789012345678901234567890',
          ethers.utils.parseUnits('0.01', 18),
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.INVALID_ADDRESS);
      }
    });
    it('throws an error when senderAddress is not a valid address and the token is ERC20', async () => {
      expect.assertions(2);
      try {
        await tokenBridge['validateDepositArgs'](
          '0x1234567890123456789012345678901234567890',
          'invalidAddress',
          ethers.utils.parseUnits('0.01', 18),
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.INVALID_ADDRESS);
      }
    });
    it('throws an error when senderAddress is not a valid address and the token is NATIVE', async () => {
      expect.assertions(2);
      try {
        await tokenBridge['validateDepositArgs'](
          'NATIVE',
          'invalidAddress',
          ethers.utils.parseUnits('0.01', 18),
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.INVALID_ADDRESS);
      }
    });
    it('throws an error when token is not a valid address', async () => {
      expect.assertions(2);
      try {
        await tokenBridge['validateDepositArgs'](
          'invalidToken',
          '0x1234567890123456789012345678901234567890',
          ethers.utils.parseUnits('0.01', 18),
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.INVALID_ADDRESS);
      }
    });
    it('throws an error when amount is less than or equal to 0 and token is ERC20', async () => {
      expect.assertions(2);
      try {
        await tokenBridge['validateDepositArgs'](
          '0x1234567890123456789012345678901234567890',
          '0x1234567890123456789012345678901234567890',
          ethers.BigNumber.from(0),
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.INVALID_AMOUNT);
      }
    });
    it('throws an error when amount is less than or equal to 0 and token is NATIVE', async () => {
      expect.assertions(2);
      try {
        await tokenBridge['validateDepositArgs'](
          'NATIVE',
          '0x1234567890123456789012345678901234567890',
          ethers.BigNumber.from(0),
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.INVALID_AMOUNT);
      }
    });
  });

  describe('validateChainIds', () => {
    let tokenBridge: TokenBridge;
    beforeEach(() => {
      const voidRootProvider = new ethers.providers.JsonRpcProvider('x');
      const voidChildProvider = new ethers.providers.JsonRpcProvider('x');
      const bridgeConfig = new BridgeConfiguration({
        baseConfig: new ImmutableConfiguration({
          environment: Environment.SANDBOX,
        }),
        bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_TESTNET,
        rootProvider: voidRootProvider,
        childProvider: voidChildProvider,
      });
      tokenBridge = new TokenBridge(bridgeConfig);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
    it('does not throw an error when everything setup correctly', async () => {
      expect.assertions(0);
      try {
        await tokenBridge['validateChainIds'](
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.INVALID_SOURCE_CHAIN_ID);
      }
    });
    it('throws an error when the sourceChainId is not one of the ones set in the initializer', async () => {
      expect.assertions(2);
      try {
        await tokenBridge['validateChainIds'](
          '100',
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.INVALID_SOURCE_CHAIN_ID);
      }
    });
    it('throws an error when the destinationChainId is not one of the ones set in the initializer', async () => {
      expect.assertions(2);
      try {
        await tokenBridge['validateChainIds'](
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
          '100',
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.INVALID_DESTINATION_CHAIN_ID);
      }
    });
    it('throws an error when the sourceChainId is the same as the  destinationChainId', async () => {
      expect.assertions(2);
      try {
        await tokenBridge['validateChainIds'](
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.CHAIN_IDS_MATCH);
      }
    });
  });

  describe('validateChainConfiguration', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('does not throw an error when everything setup correctly', async () => {
      const mockRootProvider = {
        getNetwork: jest.fn().mockReturnValue({ chainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID }),
      } as unknown as ethers.providers.Web3Provider;
      const mockChildProvider = {
        getNetwork: jest.fn().mockReturnValue({ chainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID }),
      } as unknown as ethers.providers.Web3Provider;

      const bridgeConfig = new BridgeConfiguration({
        baseConfig: new ImmutableConfiguration({
          environment: Environment.SANDBOX,
        }),
        bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_TESTNET,
        rootProvider: mockRootProvider,
        childProvider: mockChildProvider,
      });
      const tokenBridge:TokenBridge = new TokenBridge(bridgeConfig);

      expect.assertions(0);
      try {
        await tokenBridge['validateChainConfiguration']();
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.UNSUPPORTED_ERROR);
      }
    });
    it('throws an error when the rootProvider chainId is not the one set in the config', async () => {
      const mockRootProvider = {
        getNetwork: jest.fn().mockReturnValue({ chainId: 100 }),
      } as unknown as ethers.providers.Web3Provider;
      const mockChildProvider = {
        getNetwork: jest.fn().mockReturnValue({ chainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID }),
      } as unknown as ethers.providers.Web3Provider;

      const bridgeConfig = new BridgeConfiguration({
        baseConfig: new ImmutableConfiguration({
          environment: Environment.SANDBOX,
        }),
        bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_TESTNET,
        rootProvider: mockRootProvider,
        childProvider: mockChildProvider,
      });
      const tokenBridge:TokenBridge = new TokenBridge(bridgeConfig);

      expect.assertions(2);
      try {
        await tokenBridge['validateChainConfiguration']();
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.UNSUPPORTED_ERROR);
      }
    });

    it('throws an error when the childProvider chainId is not the one set in the config', async () => {
      const mockRootProvider = {
        getNetwork: jest.fn().mockReturnValue({ chainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID }),
      } as unknown as ethers.providers.Web3Provider;
      const mockChildProvider = {
        getNetwork: jest.fn().mockReturnValue({ chainId: '100' }),
      } as unknown as ethers.providers.Web3Provider;

      const bridgeConfig = new BridgeConfiguration({
        baseConfig: new ImmutableConfiguration({
          environment: Environment.SANDBOX,
        }),
        bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_TESTNET,
        rootProvider: mockRootProvider,
        childProvider: mockChildProvider,
      });
      const tokenBridge:TokenBridge = new TokenBridge(bridgeConfig);

      expect.assertions(2);
      try {
        await tokenBridge['validateChainConfiguration']();
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.UNSUPPORTED_ERROR);
      }
    });
  });

  describe('getFee', () => {
    let tokenBridge: TokenBridge;
    const mockERC20Contract = {
      allowance: jest.fn(),
      interface: {
        encodeFunctionData: jest.fn(),
      },
    };

    const originalValidateDepositArgs = TokenBridge.prototype['validateDepositArgs'];
    const originalGetGasEstimates = TokenBridge.prototype['getGasEstimates'];
    const originalCalculateBridgeFee = TokenBridge.prototype['calculateBridgeFee'];
    const originalGetTenderlyBridgeGasEstimates = TokenBridge.prototype['getTenderlyBridgeGasEstimates'];

    const sourceChainGas:ethers.BigNumber = ethers.utils.parseUnits('0.000001', 18);
    const approvalGas:ethers.BigNumber = ethers.utils.parseUnits('0.000001', 18);
    const destinationChainGas:ethers.BigNumber = ethers.utils.parseUnits('0.000001', 18);
    const validatorFee:ethers.BigNumber = ethers.utils.parseUnits('0.0001', 18);
    const bridgeFee:ethers.BigNumber = destinationChainGas.add(validatorFee);
    const imtblFee:ethers.BigNumber = ethers.BigNumber.from(0);
    const totalFees:ethers.BigNumber = sourceChainGas.add(bridgeFee).add(imtblFee);
    const sender = '0xEac347177DbA4a190B632C7d9b8da2AbfF57c772';
    const receipient = '0xA383968dC8711FFE8A7353AdE9feF7Ddcb1473a0';
    const token = '0x40b87d235A5B010a20A241F15797C9debf1ecd01';

    beforeEach(() => {
      const voidRootProvider = new ethers.providers.JsonRpcProvider('x');
      const voidChildProvider = new ethers.providers.JsonRpcProvider('x');
      const bridgeConfig = new BridgeConfiguration({
        baseConfig: new ImmutableConfiguration({
          environment: Environment.SANDBOX,
        }),
        bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_TESTNET,
        rootProvider: voidRootProvider,
        childProvider: voidChildProvider,
      });
      jest.spyOn(ethers, 'Contract').mockReturnValue(mockERC20Contract as any);
      jest.spyOn(TokenBridge.prototype as any, 'validateChainConfiguration')
        .mockImplementation(async () => 'Valid');
      jest.spyOn(TokenBridge.prototype as any, 'getGasEstimates')
        .mockImplementation(async () => ethers.utils.parseUnits('0.000001', 18));
      jest.spyOn(TokenBridge.prototype as any, 'calculateBridgeFee')
        .mockImplementation(async () => ({
          bridgeFee,
        }));
      tokenBridge = new TokenBridge(bridgeConfig);
    });

    afterEach(() => {
      jest.clearAllMocks();
      TokenBridge.prototype['validateDepositArgs'] = originalValidateDepositArgs;
      TokenBridge.prototype['getGasEstimates'] = originalGetGasEstimates;
      TokenBridge.prototype['calculateBridgeFee'] = originalCalculateBridgeFee;
      TokenBridge.prototype['getTenderlyBridgeGasEstimates'] = originalGetTenderlyBridgeGasEstimates;
    });

    it('returns the static deposit fees for native tokens', async () => {
      expect.assertions(6);

      const amount = ethers.BigNumber.from(1000);
      const result = await tokenBridge.getFee(
        {
          action: BridgeFeeActions.DEPOSIT,
          gasMultiplier: 1.1,
          sourceChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
          destinationChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
          amount,
          token: 'NATIVE',
          senderAddress: '0x0',
          recipientAddress: '0x0',
        },
      );

      expect(result).not.toBeNull();
      expect(result.sourceChainGas).toStrictEqual(sourceChainGas);
      expect(result.approvalFee).toStrictEqual(ethers.BigNumber.from(0));
      expect(result.bridgeFee).toStrictEqual(bridgeFee);
      expect(result.imtblFee).toStrictEqual(imtblFee);
      expect(result.totalFees).toStrictEqual(totalFees);
    });

    it('returns the static deposit fees for ERC20 tokens', async () => {
      expect.assertions(6);
      const amount = ethers.BigNumber.from(1000);
      const allowance = ethers.BigNumber.from(1000);

      mockERC20Contract.allowance.mockResolvedValue(allowance);

      const result = await tokenBridge.getFee(
        {
          action: BridgeFeeActions.DEPOSIT,
          gasMultiplier: 1.1,
          sourceChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
          destinationChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
          amount,
          token,
          senderAddress: '0x0',
          recipientAddress: '0x0',
        },
      );

      expect(result).not.toBeNull();
      expect(result.sourceChainGas).toStrictEqual(sourceChainGas);
      expect(result.approvalFee).toStrictEqual(approvalGas);
      expect(result.bridgeFee).toStrictEqual(bridgeFee);
      expect(result.imtblFee).toStrictEqual(imtblFee);
      expect(result.totalFees).toStrictEqual(totalFees.add(approvalGas));
    });

    it('returns the dynamic deposit fees for native tokens', async () => {
      expect.assertions(6);

      jest.spyOn(TokenBridge.prototype as any, 'getTenderlyBridgeGasEstimates')
        .mockImplementation(async () => ({
          approvalFee: 0,
          sourceChainGas: 1000,
        }));

      const amount = ethers.BigNumber.from(1000);
      const result = await tokenBridge.getFee(
        {
          action: BridgeFeeActions.DEPOSIT,
          gasMultiplier: 1.1,
          sourceChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
          destinationChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
          amount,
          token: 'NATIVE',
          senderAddress: sender,
          recipientAddress: receipient,
        },
      );

      expect(result).not.toBeNull();
      expect(result.sourceChainGas).toStrictEqual(sourceChainGas);
      expect(result.approvalFee).toStrictEqual(ethers.BigNumber.from(0));
      expect(result.bridgeFee).toStrictEqual(bridgeFee);
      expect(result.imtblFee).toStrictEqual(imtblFee);
      expect(result.totalFees).toStrictEqual(totalFees);
    });

    it('returns the dynamic deposit fees for ERC20 tokens with no allowance required', async () => {
      expect.assertions(6);
      const amount = ethers.BigNumber.from(1000);
      const allowance = ethers.BigNumber.from(1000);

      mockERC20Contract.allowance.mockResolvedValue(allowance);

      jest.spyOn(TokenBridge.prototype as any, 'getTenderlyBridgeGasEstimates')
        .mockImplementation(async () => ({
          approvalFee: 0,
          sourceChainGas: 1000,
        }));

      const result = await tokenBridge.getFee(
        {
          action: BridgeFeeActions.DEPOSIT,
          gasMultiplier: 1.1,
          sourceChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
          destinationChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
          amount,
          token,
          senderAddress: sender,
          recipientAddress: receipient,
        },
      );

      expect(result).not.toBeNull();
      expect(result.sourceChainGas).toStrictEqual(sourceChainGas);
      expect(result.approvalFee).toStrictEqual(ethers.BigNumber.from(0));
      expect(result.bridgeFee).toStrictEqual(bridgeFee);
      expect(result.imtblFee).toStrictEqual(imtblFee);
      expect(result.totalFees).toStrictEqual(totalFees);
    });

    it('returns the dynamic deposit fees for ERC20 tokens with allowance requiring increase', async () => {
      expect.assertions(6);
      const amount = ethers.BigNumber.from(1000);
      const allowance = ethers.BigNumber.from(500);

      mockERC20Contract.allowance.mockResolvedValue(allowance);

      jest.spyOn(TokenBridge.prototype as any, 'getTenderlyBridgeGasEstimates')
        .mockImplementation(async () => ({
          approvalFee: 1000,
          sourceChainGas: 1000,
        }));

      const result = await tokenBridge.getFee(
        {
          action: BridgeFeeActions.DEPOSIT,
          gasMultiplier: 1.1,
          sourceChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
          destinationChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
          amount,
          token,
          senderAddress: sender,
          recipientAddress: receipient,
        },
      );

      expect(result).not.toBeNull();
      expect(result.sourceChainGas).toStrictEqual(sourceChainGas);
      expect(result.approvalFee).toStrictEqual(approvalGas);
      expect(result.bridgeFee).toStrictEqual(bridgeFee);
      expect(result.imtblFee).toStrictEqual(imtblFee);
      expect(result.totalFees).toStrictEqual(totalFees.add(approvalGas));
    });

    it('returns the dynamic withdrawal fees for native tokens', async () => {
      expect.assertions(6);
      const amount = ethers.BigNumber.from(1000);
      const result = await tokenBridge.getFee(
        {
          action: BridgeFeeActions.WITHDRAW,
          gasMultiplier: 1.1,
          sourceChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
          destinationChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
          amount,
          token: 'NATIVE',
          senderAddress: sender,
          recipientAddress: receipient,
        },
      );

      expect(result).not.toBeNull();
      expect(result.sourceChainGas).toStrictEqual(sourceChainGas);
      expect(result.approvalFee).toStrictEqual(ethers.BigNumber.from(0));
      expect(result.bridgeFee).toStrictEqual(bridgeFee);
      expect(result.imtblFee).toStrictEqual(imtblFee);
      expect(result.totalFees).toStrictEqual(totalFees);
    });

    it('returns the dynamic withdrawal fees for ERC20 tokens with no allowance required', async () => {
      expect.assertions(6);
      const amount = ethers.BigNumber.from(1000);
      const allowance = ethers.BigNumber.from(1000);

      mockERC20Contract.allowance.mockResolvedValue(allowance);

      const result = await tokenBridge.getFee(
        {
          action: BridgeFeeActions.WITHDRAW,
          gasMultiplier: 1.1,
          sourceChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
          destinationChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
          amount,
          token,
          senderAddress: sender,
          recipientAddress: receipient,
        },
      );

      expect(result).not.toBeNull();
      expect(result.sourceChainGas).toStrictEqual(sourceChainGas);
      expect(result.approvalFee).toStrictEqual(ethers.BigNumber.from(0));
      expect(result.bridgeFee).toStrictEqual(bridgeFee);
      expect(result.imtblFee).toStrictEqual(imtblFee);
      expect(result.totalFees).toStrictEqual(totalFees);
    });

    it('returns the dynamicwithdrawal fees for ERC20 tokens with allowance requiring increase', async () => {
      expect.assertions(6);
      const amount = ethers.BigNumber.from(1000);
      const allowance = ethers.BigNumber.from(500);

      mockERC20Contract.allowance.mockResolvedValue(allowance);

      jest.spyOn(TokenBridge.prototype as any, 'getTenderlyBridgeGasEstimates')
        .mockImplementation(async () => ({
          approvalFee: 1000,
          sourceChainGas: 1000,
        }));

      const result = await tokenBridge.getFee(
        {
          action: BridgeFeeActions.WITHDRAW,
          gasMultiplier: 1.1,
          sourceChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
          destinationChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
          amount,
          token,
          senderAddress: sender,
          recipientAddress: receipient,
        },
      );

      expect(result).not.toBeNull();
      expect(result.sourceChainGas).toStrictEqual(sourceChainGas);
      expect(result.approvalFee).toStrictEqual(approvalGas);
      expect(result.bridgeFee).toStrictEqual(bridgeFee);
      expect(result.imtblFee).toStrictEqual(imtblFee);
      expect(result.totalFees).toStrictEqual(totalFees.add(approvalGas));
    });
  });

  describe('getStaticGasLimit', () => {
    let tokenBridge: TokenBridge;
    let bridgeConfig: BridgeConfiguration;
    beforeEach(() => {
      const voidRootProvider = new ethers.providers.JsonRpcProvider('x');
      const voidChildProvider = new ethers.providers.JsonRpcProvider('x');
      bridgeConfig = new BridgeConfiguration({
        baseConfig: new ImmutableConfiguration({
          environment: Environment.SANDBOX,
        }),
        bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_TESTNET,
        rootProvider: voidRootProvider,
        childProvider: voidChildProvider,
      });
      tokenBridge = new TokenBridge(bridgeConfig);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
    describe('IMX', () => {
      it('returns value for IMX deposit', async () => {
        expect.assertions(4);
        const response = await tokenBridge['getStaticGasLimit'](
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
          bridgeConfig.bridgeContracts.rootChainIMX,
          '0x01',
          '0x01',
        );
        expect(response.sourceGas).toBeDefined();
        expect(response.destinationGas).toBeDefined();
        expect(response.symbol).toBe('IMX');
        expect(response.action).toBe('deposit');
      });
      it('returns value for IMX depositTo', async () => {
        expect.assertions(4);
        const response = await tokenBridge['getStaticGasLimit'](
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
          bridgeConfig.bridgeContracts.rootChainIMX,
          '0x01',
          '0x02',
        );
        expect(response.sourceGas).toBeDefined();
        expect(response.destinationGas).toBeDefined();
        expect(response.symbol).toBe('IMX');
        expect(response.action).toBe('depositTo');
      });
      it('returns value for native withdraw', async () => {
        expect.assertions(4);
        const response = await tokenBridge['getStaticGasLimit'](
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
          'NATIVE',
          '0x01',
          '0x01',
        );
        expect(response.sourceGas).toBeDefined();
        expect(response.destinationGas).toBeDefined();
        expect(response.symbol).toBe('IMX');
        expect(response.action).toBe('withdraw');
      });
      it('returns value for native withdrawTo', async () => {
        expect.assertions(4);
        const response = await tokenBridge['getStaticGasLimit'](
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
          'NATIVE',
          '0x01',
          '0x02',
        );
        expect(response.sourceGas).toBeDefined();
        expect(response.destinationGas).toBeDefined();
        expect(response.symbol).toBe('IMX');
        expect(response.action).toBe('withdrawTo');
      });
    });

    describe('ETH', () => {
      it('returns value for ETH deposit', async () => {
        expect.assertions(4);
        const response = await tokenBridge['getStaticGasLimit'](
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
          'NATIVE',
          '0x01',
          '0x01',
        );
        expect(response.sourceGas).toBeDefined();
        expect(response.destinationGas).toBeDefined();
        expect(response.symbol).toBe('ETH');
        expect(response.action).toBe('deposit');
      });
      it('returns value for ETH depositTo', async () => {
        expect.assertions(4);
        const response = await tokenBridge['getStaticGasLimit'](
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
          'NATIVE',
          '0x01',
          '0x02',
        );
        expect(response.sourceGas).toBeDefined();
        expect(response.destinationGas).toBeDefined();
        expect(response.symbol).toBe('ETH');
        expect(response.action).toBe('depositTo');
      });
      it('returns value for ETH withdraw', async () => {
        expect.assertions(4);
        const response = await tokenBridge['getStaticGasLimit'](
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
          bridgeConfig.bridgeContracts.childChainWrappedETH,
          '0x01',
          '0x01',
        );
        expect(response.sourceGas).toBeDefined();
        expect(response.destinationGas).toBeDefined();
        expect(response.symbol).toBe('ETH');
        expect(response.action).toBe('withdraw');
      });
      it('returns value for ETH withdrawTo', async () => {
        expect.assertions(4);
        const response = await tokenBridge['getStaticGasLimit'](
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
          bridgeConfig.bridgeContracts.childChainWrappedETH,
          '0x01',
          '0x02',
        );
        expect(response.sourceGas).toBeDefined();
        expect(response.destinationGas).toBeDefined();
        expect(response.symbol).toBe('ETH');
        expect(response.action).toBe('withdrawTo');
      });
    });

    describe('WETH', () => {
      it('returns value for WETH deposit', async () => {
        expect.assertions(4);
        const response = await tokenBridge['getStaticGasLimit'](
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
          bridgeConfig.bridgeContracts.rootChainWrappedETH,
          '0x01',
          '0x01',
        );
        expect(response.sourceGas).toBeDefined();
        expect(response.destinationGas).toBeDefined();
        expect(response.symbol).toBe('WETH');
        expect(response.action).toBe('deposit');
      });
      it('returns value for WETH depositTo', async () => {
        expect.assertions(4);
        const response = await tokenBridge['getStaticGasLimit'](
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
          bridgeConfig.bridgeContracts.rootChainWrappedETH,
          '0x01',
          '0x02',
        );
        expect(response.sourceGas).toBeDefined();
        expect(response.destinationGas).toBeDefined();
        expect(response.symbol).toBe('WETH');
        expect(response.action).toBe('depositTo');
      });
    });

    describe('USDC', () => {
      it('returns value for USDC deposit', async () => {
        expect.assertions(4);
        const response = await tokenBridge['getStaticGasLimit'](
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
          bridgeConfig.bridgeContracts.rootChainUSDC,
          '0x01',
          '0x01',
        );
        expect(response.sourceGas).toBeDefined();
        expect(response.destinationGas).toBeDefined();
        expect(response.symbol).toBe('USDC');
        expect(response.action).toBe('deposit');
      });
      it('returns value for USDC depositTo', async () => {
        expect.assertions(4);
        const response = await tokenBridge['getStaticGasLimit'](
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
          bridgeConfig.bridgeContracts.rootChainUSDC,
          '0x01',
          '0x02',
        );
        expect(response.sourceGas).toBeDefined();
        expect(response.destinationGas).toBeDefined();
        expect(response.symbol).toBe('USDC');
        expect(response.action).toBe('depositTo');
      });
      it('returns value for USDC withdraw', async () => {
        expect.assertions(4);
        const response = await tokenBridge['getStaticGasLimit'](
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
          bridgeConfig.bridgeContracts.childChainWrappedUSDC,
          '0x01',
          '0x01',
        );
        expect(response.sourceGas).toBeDefined();
        expect(response.destinationGas).toBeDefined();
        expect(response.symbol).toBe('USDC');
        expect(response.action).toBe('withdraw');
      });
      it('returns value for USDC withdrawTo', async () => {
        expect.assertions(4);
        const response = await tokenBridge['getStaticGasLimit'](
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
          bridgeConfig.bridgeContracts.childChainWrappedUSDC,
          '0x01',
          '0x02',
        );
        expect(response.sourceGas).toBeDefined();
        expect(response.destinationGas).toBeDefined();
        expect(response.symbol).toBe('USDC');
        expect(response.action).toBe('withdrawTo');
      });
    });

    describe('DEFAULT', () => {
      it('returns value for DEFAULT deposit', async () => {
        expect.assertions(4);
        const response = await tokenBridge['getStaticGasLimit'](
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
          '0xDEFAULT',
          '0x01',
          '0x01',
        );
        expect(response.sourceGas).toBeDefined();
        expect(response.destinationGas).toBeDefined();
        expect(response.symbol).toBe('DEFAULT');
        expect(response.action).toBe('deposit');
      });
      it('returns value for DEFAULT depositTo', async () => {
        expect.assertions(4);
        const response = await tokenBridge['getStaticGasLimit'](
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
          '0xDEFAULT',
          '0x01',
          '0x02',
        );
        expect(response.sourceGas).toBeDefined();
        expect(response.destinationGas).toBeDefined();
        expect(response.symbol).toBe('DEFAULT');
        expect(response.action).toBe('depositTo');
      });
      it('returns value for DEFAULT withdraw', async () => {
        expect.assertions(4);
        const response = await tokenBridge['getStaticGasLimit'](
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
          '0xDEFAULT',
          '0x01',
          '0x01',
        );
        expect(response.sourceGas).toBeDefined();
        expect(response.destinationGas).toBeDefined();
        expect(response.symbol).toBe('DEFAULT');
        expect(response.action).toBe('withdraw');
      });
      it('returns value for DEFAULT withdrawTo', async () => {
        expect.assertions(4);
        const response = await tokenBridge['getStaticGasLimit'](
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
          '0xDEFAULT',
          '0x01',
          '0x02',
        );
        expect(response.sourceGas).toBeDefined();
        expect(response.destinationGas).toBeDefined();
        expect(response.symbol).toBe('DEFAULT');
        expect(response.action).toBe('withdrawTo');
      });
    });
  });

  describe('getTransactionStatus', () => {
    let tokenBridge: TokenBridge;

    const DEPOSIT_SIG = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('DEPOSIT'));
    const WITHDRAW_SIG = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('WITHDRAW'));

    const amount = ethers.BigNumber.from(1000);
    const token = '0x40b87d235A5B010a20A241F15797C9debf1ecd01';
    const sender = '0xEac347177DbA4a190B632C7d9b8da2AbfF57c772';
    const recipient = '0xA383968dC8711FFE8A7353AdE9feF7Ddcb1473a0';

    const abiCoder = new ethers.utils.AbiCoder();
    const mockDepositPayload = abiCoder.encode(
      ['bytes32', 'address', 'address', 'address', 'uint256'],
      [
        DEPOSIT_SIG,
        token,
        sender,
        recipient,
        amount,
      ],
    );
    const mockWithdrawPayload = abiCoder.encode(
      ['bytes32', 'address', 'address', 'address', 'uint256'],
      [
        WITHDRAW_SIG,
        token,
        sender,
        recipient,
        amount,
      ],
    );

    const mockERC20ContractFlowRate = {
      allowance: jest.fn(),
      interface: {
        encodeFunctionData: jest.fn(),
      },
      getPendingWithdrawals: jest.fn().mockImplementation(async () => [
        {
          withdrawer: '0xEac347177DbA4a190B632C7d9b8da2AbfF57c772',
          token: '0x40b87d235A5B010a20A241F15797C9debf1ecd01',
          amount,
          timestamp: ethers.BigNumber.from(1000),
        },
      ]),
      getPendingWithdrawalsLength: jest.fn().mockImplementation(async () => ethers.BigNumber.from(1)),
      withdrawalDelay: jest.fn().mockImplementation(async () => ethers.BigNumber.from(60 * 60 * 24)),
    };

    const mockERC20ContractFlowRateMultiple = {
      allowance: jest.fn(),
      interface: {
        encodeFunctionData: jest.fn(),
      },
      getPendingWithdrawals: jest.fn().mockImplementation(async () => [
        {
          withdrawer: '0xEac347177DbA4a190B632C7d9b8da2AbfF57c772',
          token: '0x40b87d235A5B010a20A241F15797C9debf1ecd01',
          amount,
          timestamp: ethers.BigNumber.from(1000),
        },
        {
          withdrawer: '0xEac347177DbA4a190B632C7d9b8da2AbfF57c772',
          token: '0x40b87d235A5B010a20A241F15797C9debf1ecd01',
          amount,
          timestamp: ethers.BigNumber.from(1001),
        },
      ]),
      getPendingWithdrawalsLength: jest.fn().mockImplementation(async () => ethers.BigNumber.from(1)),
      withdrawalDelay: jest.fn().mockImplementation(async () => ethers.BigNumber.from(60 * 60 * 24)),
    };

    const mockERC20Contract = {
      allowance: jest.fn(),
      interface: {
        encodeFunctionData: jest.fn(),
      },
      getPendingWithdrawals: jest.fn().mockImplementation(async () => []),
      getPendingWithdrawalsLength: jest.fn().mockImplementation(async () => ethers.BigNumber.from(0)),
    };

    beforeEach(() => {
      const voidRootProvider = new ethers.providers.JsonRpcProvider('x');
      const voidChildProvider = new ethers.providers.JsonRpcProvider('x');
      const bridgeConfig = new BridgeConfiguration({
        baseConfig: new ImmutableConfiguration({
          environment: Environment.SANDBOX,
        }),
        bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_TESTNET,
        rootProvider: voidRootProvider,
        childProvider: voidChildProvider,
      });
      jest.spyOn(ethers, 'Contract').mockReturnValue(mockERC20Contract as any);
      tokenBridge = new TokenBridge(bridgeConfig);
    });

    afterEach(() => {
      jest.clearAllMocks();
      // TokenBridge.prototype['queryTransactionStatus'] = originalQueryTransactionStatus;
    });
    it('returns the PENDING status for a deposit', async () => {
      expect.assertions(8);

      (queryTransactionStatus as jest.Mock).mockReturnValue({
        status: GMPStatus.CANNOT_FETCH_STATUS,
        gasPaidInfo: {
          status: GasPaidStatus.GAS_PAID,
        },
        callTx: {
          returnValues: {
            payload: mockDepositPayload,
          },
        },
      });

      const txHash = '0x5c192bf2b3be59de3a69877f6c71fd0affe6e1a1c05a75f51d4a60692001d8f3';
      const result = await tokenBridge.getTransactionStatus({
        transactions: [{
          txHash,
        }],
        sourceChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
      });

      expect(result).not.toBeNull();
      expect(result.transactions.length).toBe(1);
      expect(result.transactions[0].status).toBe(StatusResponse.PENDING);
      expect(result.transactions[0].txHash).toBe(txHash);
      expect(result.transactions[0].token).toBe(token);
      expect(result.transactions[0].sender).toBe(sender);
      expect(result.transactions[0].recipient).toBe(recipient);
      expect(result.transactions[0].amount).toStrictEqual(amount);
    });
    it('returns the PROCESSING status for a deposit', async () => {
      expect.assertions(8);

      (queryTransactionStatus as jest.Mock).mockReturnValue({
        status: GMPStatus.SRC_GATEWAY_CALLED,
        gasPaidInfo: {
          status: GasPaidStatus.GAS_PAID,
        },
        callTx: {
          returnValues: {
            payload: mockDepositPayload,
          },
        },
      });

      const txHash = '0x5c192bf2b3be59de3a69877f6c71fd0affe6e1a1c05a75f51d4a60692001d8f3';
      const result = await tokenBridge.getTransactionStatus({
        transactions: [{
          txHash,
        }],
        sourceChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
      });

      expect(result).not.toBeNull();
      expect(result.transactions.length).toBe(1);
      expect(result.transactions[0].status).toBe(StatusResponse.PROCESSING);
      expect(result.transactions[0].txHash).toBe(txHash);
      expect(result.transactions[0].token).toBe(token);
      expect(result.transactions[0].sender).toBe(sender);
      expect(result.transactions[0].recipient).toBe(recipient);
      expect(result.transactions[0].amount).toStrictEqual(amount);
    });
    it('returns the COMPLETE status for a deposit', async () => {
      expect.assertions(8);

      (queryTransactionStatus as jest.Mock).mockReturnValue({
        status: GMPStatus.DEST_EXECUTED,
        gasPaidInfo: {
          status: GasPaidStatus.GAS_PAID,
        },
        callTx: {
          returnValues: {
            payload: mockDepositPayload,
          },
        },
      });

      const txHash = '0x5c192bf2b3be59de3a69877f6c71fd0affe6e1a1c05a75f51d4a60692001d8f3';
      const result = await tokenBridge.getTransactionStatus({
        transactions: [{
          txHash,
        }],
        sourceChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
      });

      expect(result).not.toBeNull();
      expect(result.transactions.length).toBe(1);
      expect(result.transactions[0].status).toBe(StatusResponse.COMPLETE);
      expect(result.transactions[0].txHash).toBe(txHash);
      expect(result.transactions[0].token).toBe(token);
      expect(result.transactions[0].sender).toBe(sender);
      expect(result.transactions[0].recipient).toBe(recipient);
      expect(result.transactions[0].amount).toStrictEqual(amount);
    });
    it('returns the ERROR status for a deposit', async () => {
      expect.assertions(8);

      (queryTransactionStatus as jest.Mock).mockReturnValue({
        status: GMPStatus.UNKNOWN_ERROR,
        gasPaidInfo: {
          status: GasPaidStatus.GAS_PAID,
        },
        callTx: {
          returnValues: {
            payload: mockDepositPayload,
          },
        },
      });

      const txHash = '0x5c192bf2b3be59de3a69877f6c71fd0affe6e1a1c05a75f51d4a60692001d8f3';
      const result = await tokenBridge.getTransactionStatus({
        transactions: [{
          txHash,
        }],
        sourceChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
      });

      expect(result).not.toBeNull();
      expect(result.transactions.length).toBe(1);
      expect(result.transactions[0].status).toBe(StatusResponse.ERROR);
      expect(result.transactions[0].txHash).toBe(txHash);
      expect(result.transactions[0].token).toBe(token);
      expect(result.transactions[0].sender).toBe(sender);
      expect(result.transactions[0].recipient).toBe(recipient);
      expect(result.transactions[0].amount).toStrictEqual(amount);
    });
    it('returns the RETRY status for a deposit', async () => {
      expect.assertions(8);

      (queryTransactionStatus as jest.Mock).mockReturnValue({
        status: GMPStatus.NOT_EXECUTED,
        gasPaidInfo: {
          status: GasPaidStatus.GAS_PAID,
        },
        callTx: {
          returnValues: {
            payload: mockDepositPayload,
          },
        },
      });

      const txHash = '0x5c192bf2b3be59de3a69877f6c71fd0affe6e1a1c05a75f51d4a60692001d8f3';
      const result = await tokenBridge.getTransactionStatus({
        transactions: [{
          txHash,
        }],
        sourceChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
      });

      expect(result).not.toBeNull();
      expect(result.transactions.length).toBe(1);
      expect(result.transactions[0].status).toBe(StatusResponse.RETRY);
      expect(result.transactions[0].txHash).toBe(txHash);
      expect(result.transactions[0].token).toBe(token);
      expect(result.transactions[0].sender).toBe(sender);
      expect(result.transactions[0].recipient).toBe(recipient);
      expect(result.transactions[0].amount).toStrictEqual(amount);
    });
    it('returns the PENDING status for a withdrawal', async () => {
      expect.assertions(8);

      (queryTransactionStatus as jest.Mock).mockReturnValue({
        status: GMPStatus.CANNOT_FETCH_STATUS,
        gasPaidInfo: {
          status: GasPaidStatus.GAS_PAID,
        },
        callTx: {
          returnValues: {
            payload: mockWithdrawPayload,
          },
        },
      });

      const txHash = '0x5c192bf2b3be59de3a69877f6c71fd0affe6e1a1c05a75f51d4a60692001d8f3';
      const result = await tokenBridge.getTransactionStatus({
        transactions: [{
          txHash,
        }],
        sourceChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
      });

      expect(result).not.toBeNull();
      expect(result.transactions.length).toBe(1);
      expect(result.transactions[0].status).toBe(StatusResponse.PENDING);
      expect(result.transactions[0].txHash).toBe(txHash);
      expect(result.transactions[0].token).toBe(token);
      expect(result.transactions[0].sender).toBe(sender);
      expect(result.transactions[0].recipient).toBe(recipient);
      expect(result.transactions[0].amount).toStrictEqual(amount);
    });
    it('returns the PROCESSING status for a withdrawal', async () => {
      expect.assertions(8);

      (queryTransactionStatus as jest.Mock).mockReturnValue({
        status: GMPStatus.SRC_GATEWAY_CALLED,
        gasPaidInfo: {
          status: GasPaidStatus.GAS_PAID,
        },
        callTx: {
          returnValues: {
            payload: mockWithdrawPayload,
          },
        },
      });

      const txHash = '0x5c192bf2b3be59de3a69877f6c71fd0affe6e1a1c05a75f51d4a60692001d8f3';
      const result = await tokenBridge.getTransactionStatus({
        transactions: [{
          txHash,
        }],
        sourceChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
      });

      expect(result).not.toBeNull();
      expect(result.transactions.length).toBe(1);
      expect(result.transactions[0].status).toBe(StatusResponse.PROCESSING);
      expect(result.transactions[0].txHash).toBe(txHash);
      expect(result.transactions[0].token).toBe(token);
      expect(result.transactions[0].sender).toBe(sender);
      expect(result.transactions[0].recipient).toBe(recipient);
      expect(result.transactions[0].amount).toStrictEqual(amount);
    });
    it('returns the COMPLETE status for a withdrawal', async () => {
      expect.assertions(8);

      (queryTransactionStatus as jest.Mock).mockReturnValue({
        status: GMPStatus.DEST_EXECUTED,
        gasPaidInfo: {
          status: GasPaidStatus.GAS_PAID,
        },
        callTx: {
          returnValues: {
            payload: mockWithdrawPayload,
          },
        },
      });

      const txHash = '0x5c192bf2b3be59de3a69877f6c71fd0affe6e1a1c05a75f51d4a60692001d8f3';
      const result = await tokenBridge.getTransactionStatus({
        transactions: [{
          txHash,
        }],
        sourceChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
      });

      expect(result).not.toBeNull();
      expect(result.transactions.length).toBe(1);
      expect(result.transactions[0].status).toBe(StatusResponse.COMPLETE);
      expect(result.transactions[0].txHash).toBe(txHash);
      expect(result.transactions[0].token).toBe(token);
      expect(result.transactions[0].sender).toBe(sender);
      expect(result.transactions[0].recipient).toBe(recipient);
      expect(result.transactions[0].amount).toStrictEqual(amount);
    });
    it('returns the FLOW_RATE_CONTROLLED status for a withdrawal', async () => {
      expect.assertions(8);

      jest.spyOn(ethers, 'Contract').mockReturnValue(mockERC20ContractFlowRate as any);

      (queryTransactionStatus as jest.Mock).mockReturnValue({
        status: GMPStatus.DEST_EXECUTED,
        gasPaidInfo: {
          status: GasPaidStatus.GAS_PAID,
        },
        callTx: {
          returnValues: {
            payload: mockWithdrawPayload,
          },
        },
      });

      const txHash = '0x5c192bf2b3be59de3a69877f6c71fd0affe6e1a1c05a75f51d4a60692001d8f3';
      const result = await tokenBridge.getTransactionStatus({
        transactions: [{
          txHash,
        }],
        sourceChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
      });

      expect(result).not.toBeNull();
      expect(result.transactions.length).toBe(1);
      expect(result.transactions[0].status).toBe(StatusResponse.FLOW_RATE_CONTROLLED);
      expect(result.transactions[0].txHash).toBe(txHash);
      expect(result.transactions[0].token).toBe(token);
      expect(result.transactions[0].sender).toBe(sender);
      expect(result.transactions[0].recipient).toBe(recipient);
      expect(result.transactions[0].amount).toStrictEqual(amount);
    });

    it('returns the FLOW_RATE_CONTROLLED status for multiple withdrawals', async () => {
      expect.assertions(14);

      jest.spyOn(ethers, 'Contract').mockReturnValue(mockERC20ContractFlowRateMultiple as any);

      (queryTransactionStatus as jest.Mock).mockReturnValue({
        status: GMPStatus.DEST_EXECUTED,
        gasPaidInfo: {
          status: GasPaidStatus.GAS_PAID,
        },
        callTx: {
          returnValues: {
            payload: mockWithdrawPayload,
          },
        },
      });

      const txHash1 = '0x5c192bf2b3be59de3a69877f6c71fd0affe6e1a1c05a75f51d4a60692001d8f3';
      const txHash2 = '0x5c192bf2b3be59de3a69877f6c71fd0affe6e1a1c05a75f51d4a60692001d8f3';

      const result = await tokenBridge.getTransactionStatus({
        transactions: [{
          txHash: txHash1,
        }, {
          txHash: txHash2,
        }],
        sourceChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
      });

      expect(result).not.toBeNull();
      expect(result.transactions.length).toBe(2);
      expect(result.transactions[0].status).toBe(StatusResponse.FLOW_RATE_CONTROLLED);
      expect(result.transactions[0].txHash).toBe(txHash1);
      expect(result.transactions[0].token).toBe(token);
      expect(result.transactions[0].sender).toBe(sender);
      expect(result.transactions[0].recipient).toBe(recipient);
      expect(result.transactions[0].amount).toStrictEqual(amount);
      expect(result.transactions[1].status).toBe(StatusResponse.FLOW_RATE_CONTROLLED);
      expect(result.transactions[1].txHash).toBe(txHash2);
      expect(result.transactions[1].token).toBe(token);
      expect(result.transactions[1].sender).toBe(sender);
      expect(result.transactions[1].recipient).toBe(recipient);
      expect(result.transactions[1].amount).toStrictEqual(amount);
    });
    it('returns the ERROR status for a withdrawal', async () => {
      expect.assertions(8);

      (queryTransactionStatus as jest.Mock).mockReturnValue({
        status: GMPStatus.UNKNOWN_ERROR,
        gasPaidInfo: {
          status: GasPaidStatus.GAS_PAID,
        },
        callTx: {
          returnValues: {
            payload: mockWithdrawPayload,
          },
        },
      });

      const txHash = '0x5c192bf2b3be59de3a69877f6c71fd0affe6e1a1c05a75f51d4a60692001d8f3';
      const result = await tokenBridge.getTransactionStatus({
        transactions: [{
          txHash,
        }],
        sourceChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
      });

      expect(result).not.toBeNull();
      expect(result.transactions.length).toBe(1);
      expect(result.transactions[0].status).toBe(StatusResponse.ERROR);
      expect(result.transactions[0].txHash).toBe(txHash);
      expect(result.transactions[0].token).toBe(token);
      expect(result.transactions[0].sender).toBe(sender);
      expect(result.transactions[0].recipient).toBe(recipient);
      expect(result.transactions[0].amount).toStrictEqual(amount);
    });
    it('returns the RETRY status for a withdrawal', async () => {
      expect.assertions(8);

      (queryTransactionStatus as jest.Mock).mockReturnValue({
        status: GMPStatus.NOT_EXECUTED,
        gasPaidInfo: {
          status: GasPaidStatus.GAS_PAID,
        },
        callTx: {
          returnValues: {
            payload: mockWithdrawPayload,
          },
        },
      });

      const txHash = '0x5c192bf2b3be59de3a69877f6c71fd0affe6e1a1c05a75f51d4a60692001d8f3';
      const result = await tokenBridge.getTransactionStatus({
        transactions: [{
          txHash,
        }],
        sourceChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
      });

      expect(result).not.toBeNull();
      expect(result.transactions.length).toBe(1);
      expect(result.transactions[0].status).toBe(StatusResponse.RETRY);
      expect(result.transactions[0].txHash).toBe(txHash);
      expect(result.transactions[0].token).toBe(token);
      expect(result.transactions[0].sender).toBe(sender);
      expect(result.transactions[0].recipient).toBe(recipient);
      expect(result.transactions[0].amount).toStrictEqual(amount);
    });
  });

  describe('getFlowRateWithdrawTx', () => {
    let tokenBridge: TokenBridge;

    const recipient = '0xA383968dC8711FFE8A7353AdE9feF7Ddcb1473a0';
    const token = '0x40b87d235A5B010a20A241F15797C9debf1ecd01';
    const amount = ethers.BigNumber.from(1000);

    const defaultTimestamp = ethers.BigNumber.from(1000);

    const mockERC20ContractFlowRate = {
      allowance: jest.fn(),
      interface: {
        encodeFunctionData: jest.fn().mockResolvedValue('0xdata'),
      },
      getPendingWithdrawals: jest.fn().mockImplementation(async () => [
        {
          withdrawer: recipient,
          token,
          amount,
          timestamp: defaultTimestamp,
        },
      ]),
      getPendingWithdrawalsLength: jest.fn().mockImplementation(async () => ethers.BigNumber.from(1)),
      withdrawalDelay: jest.fn().mockImplementation(async () => ethers.BigNumber.from(60 * 60 * 24)),
    };

    const voidRootProvider = new ethers.providers.JsonRpcProvider('x');
    const voidChildProvider = new ethers.providers.JsonRpcProvider('x');

    const bridgeConfig = new BridgeConfiguration({
      baseConfig: new ImmutableConfiguration({
        environment: Environment.SANDBOX,
      }),
      bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_TESTNET,
      rootProvider: voidRootProvider,
      childProvider: voidChildProvider,
    });

    beforeEach(() => {
      jest.spyOn(TokenBridge.prototype as any, 'validateChainConfiguration')
        .mockImplementation(async () => 'Valid');
      jest.spyOn(TokenBridge.prototype as any, 'validateDepositArgs')
        .mockImplementation(async () => 'Valid');
      tokenBridge = new TokenBridge(bridgeConfig);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
    it('returns the flowRate withdraw transaction when the index and recipient are valid', async () => {
      expect.assertions(10);
      const req = {
        recipient,
        index: 0,
      };

      jest.spyOn(ethers, 'Contract').mockReturnValue(mockERC20ContractFlowRate as any);

      const result = await tokenBridge.getFlowRateWithdrawTx(req);

      expect(result.unsignedTx).toBeDefined();
      expect(result.unsignedTx?.data).toBe('0xdata');
      expect(result.unsignedTx?.to).toBe(bridgeConfig.bridgeContracts.rootERC20BridgeFlowRate);
      expect(result.unsignedTx?.value).toBe(0);
      expect(result.pendingWithdrawal.canWithdraw).toBe(true);
      expect(result.pendingWithdrawal.withdrawer).toBe(recipient);
      expect(result.pendingWithdrawal.token).toBe(token);
      expect(result.pendingWithdrawal.amount).toBe(amount);
      expect(result.pendingWithdrawal.timeoutStart).toBe(defaultTimestamp.toNumber());
      expect(result.pendingWithdrawal.timeoutEnd).toBe(defaultTimestamp.toNumber() + (60 * 60 * 24));
    });

    it('throws an error when the index is not valid', async () => {
      expect.assertions(2);
      const req = {
        recipient,
        index: 100,
      };

      const mockERC20ContractFlowRateNotFound = {
        allowance: jest.fn(),
        interface: {
          encodeFunctionData: jest.fn().mockResolvedValue('0xdata'),
        },
        getPendingWithdrawals: jest.fn().mockImplementation(async () => [
          {
            withdrawer: ethers.constants.AddressZero,
            token: ethers.constants.AddressZero,
            amount: ethers.BigNumber.from(0),
            timestamp: ethers.BigNumber.from(0),
          },
        ]),
        getPendingWithdrawalsLength: jest.fn().mockImplementation(async () => ethers.BigNumber.from(0)),
        withdrawalDelay: jest.fn().mockImplementation(async () => ethers.BigNumber.from(60 * 60 * 24)),
      };

      jest.spyOn(ethers, 'Contract').mockReturnValue(mockERC20ContractFlowRateNotFound as any);

      try {
        await tokenBridge.getFlowRateWithdrawTx(req);
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.FLOW_RATE_ERROR);
      }
    });

    it('returns the flowRate info if the transcation is not ready to be withdrawn', async () => {
      expect.assertions(7);
      const req = {
        recipient,
        index: 0,
      };

      const timestampNow = Math.floor(Date.now() / 1000);

      const timestamp = ethers.BigNumber.from(timestampNow + (60 * 60 * 12));

      const mockERC20ContractFlowRateNotReady = {
        allowance: jest.fn(),
        interface: {
          encodeFunctionData: jest.fn().mockResolvedValue('0xdata'),
        },
        getPendingWithdrawals: jest.fn().mockImplementation(async () => [
          {
            withdrawer: recipient,
            token,
            amount,
            timestamp,
          },
        ]),
        withdrawalDelay: jest.fn().mockImplementation(async () => ethers.BigNumber.from(60 * 60 * 24)),
      };

      jest.spyOn(ethers, 'Contract').mockReturnValue(mockERC20ContractFlowRateNotReady as any);

      const result = await tokenBridge.getFlowRateWithdrawTx(req);

      expect(result.unsignedTx).toBeNull();
      expect(result.pendingWithdrawal.canWithdraw).toBe(false);
      expect(result.pendingWithdrawal.withdrawer).toBe(recipient);
      expect(result.pendingWithdrawal.token).toBe(token);
      expect(result.pendingWithdrawal.amount).toBe(amount);
      expect(result.pendingWithdrawal.timeoutStart).toBe(timestamp.toNumber());
      expect(result.pendingWithdrawal.timeoutEnd).toBe(timestamp.toNumber() + (60 * 60 * 24));
    });
  });

  describe('getPendingWithdrawals', () => {
    let tokenBridge: TokenBridge;

    const recipient = '0xA383968dC8711FFE8A7353AdE9feF7Ddcb1473a0';
    const token = '0x40b87d235A5B010a20A241F15797C9debf1ecd01';
    const amount = ethers.BigNumber.from(1000);

    const defaultTimestamp = ethers.BigNumber.from(1000);
    const futureTimestamp = ethers.BigNumber.from(1000000000000);

    const mockERC20ContractFlowRate = {
      allowance: jest.fn(),
      interface: {
        encodeFunctionData: jest.fn().mockResolvedValue('0xdata'),
      },
      getPendingWithdrawals: jest.fn().mockImplementation(async () => [
        {
          withdrawer: recipient,
          token,
          amount,
          timestamp: defaultTimestamp,
        },
      ]),
      getPendingWithdrawalsLength: jest.fn().mockImplementation(async () => ethers.BigNumber.from(1)),
      withdrawalDelay: jest.fn().mockImplementation(async () => ethers.BigNumber.from(60 * 60 * 24)),
    };

    const voidRootProvider = new ethers.providers.JsonRpcProvider('x');
    const voidChildProvider = new ethers.providers.JsonRpcProvider('x');

    const bridgeConfig = new BridgeConfiguration({
      baseConfig: new ImmutableConfiguration({
        environment: Environment.SANDBOX,
      }),
      bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_TESTNET,
      rootProvider: voidRootProvider,
      childProvider: voidChildProvider,
    });

    beforeEach(() => {
      jest.spyOn(TokenBridge.prototype as any, 'validateChainConfiguration')
        .mockImplementation(async () => 'Valid');
      jest.spyOn(TokenBridge.prototype as any, 'validateDepositArgs')
        .mockImplementation(async () => 'Valid');
      tokenBridge = new TokenBridge(bridgeConfig);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
    it('returns the flowRate pending withdrawals [1] when the recipient is valid', async () => {
      expect.assertions(8);
      const req = {
        recipient,
      };

      jest.spyOn(ethers, 'Contract').mockReturnValue(mockERC20ContractFlowRate as any);

      const result = await tokenBridge.getPendingWithdrawals(req);

      expect(result.pending).toBeDefined();
      expect(result.pending.length).toBe(1);
      expect(result.pending[0].canWithdraw).toBe(true);
      expect(result.pending[0].withdrawer).toBe(recipient);
      expect(result.pending[0].token).toBe(token);
      expect(result.pending[0].amount).toBe(amount);
      expect(result.pending[0].timeoutStart).toBe(defaultTimestamp.toNumber());
      expect(result.pending[0].timeoutEnd).toBe(defaultTimestamp.toNumber() + (60 * 60 * 24));
    });

    it('returns the flowRate pending withdrawals [3] when the recipient is valid', async () => {
      expect.assertions(20);
      const req = {
        recipient,
      };

      const mockERC20ContractFlowRateThree = {
        allowance: jest.fn(),
        interface: {
          encodeFunctionData: jest.fn().mockResolvedValue('0xdata'),
        },
        getPendingWithdrawals: jest.fn().mockImplementation(async () => [
          {
            withdrawer: `${recipient}1`,
            token: `${token}1`,
            amount: amount.mul(1),
            timestamp: defaultTimestamp.mul(1),
          },
          {
            withdrawer: `${recipient}2`,
            token: `${token}2`,
            amount: amount.mul(2),
            timestamp: futureTimestamp,
          },
          {
            withdrawer: `${recipient}3`,
            token: `${token}3`,
            amount: amount.mul(3),
            timestamp: defaultTimestamp.mul(3),
          },
        ]),
        getPendingWithdrawalsLength: jest.fn().mockImplementation(async () => ethers.BigNumber.from(3)),
        withdrawalDelay: jest.fn().mockImplementation(async () => ethers.BigNumber.from(60 * 60 * 24)),

      };

      jest.spyOn(ethers, 'Contract').mockReturnValue(mockERC20ContractFlowRateThree as any);

      const result = await tokenBridge.getPendingWithdrawals(req);

      expect(result.pending).toBeDefined();
      expect(result.pending.length).toBe(3);
      expect(result.pending[0].canWithdraw).toBe(true);
      expect(result.pending[0].withdrawer).toBe(`${recipient}1`);
      expect(result.pending[0].token).toBe(`${token}1`);
      expect(result.pending[0].amount).toStrictEqual(amount.mul(1));
      expect(result.pending[0].timeoutStart).toBe(defaultTimestamp.mul(1).toNumber());
      expect(result.pending[0].timeoutEnd).toBe(defaultTimestamp.mul(1).toNumber() + (60 * 60 * 24));
      expect(result.pending[1].canWithdraw).toBe(false);
      expect(result.pending[1].withdrawer).toBe(`${recipient}2`);
      expect(result.pending[1].token).toBe(`${token}2`);
      expect(result.pending[1].amount).toStrictEqual(amount.mul(2));
      expect(result.pending[1].timeoutStart).toBe(futureTimestamp.toNumber());
      expect(result.pending[1].timeoutEnd).toBe(futureTimestamp.toNumber() + (60 * 60 * 24));
      expect(result.pending[2].canWithdraw).toBe(true);
      expect(result.pending[2].withdrawer).toBe(`${recipient}3`);
      expect(result.pending[2].token).toBe(`${token}3`);
      expect(result.pending[2].amount).toStrictEqual(amount.mul(3));
      expect(result.pending[2].timeoutStart).toBe(defaultTimestamp.mul(3).toNumber());
      expect(result.pending[2].timeoutEnd).toBe(defaultTimestamp.mul(3).toNumber() + (60 * 60 * 24));
    });

    it('returns empty pending array when no flowRated transactions found', async () => {
      expect.assertions(2);
      const req = {
        recipient,
      };

      const mockERC20ContractFlowRateNone = {
        allowance: jest.fn(),
        interface: {
          encodeFunctionData: jest.fn().mockResolvedValue('0xdata'),
        },
        getPendingWithdrawals: jest.fn().mockImplementation(async () => [
          {
            withdrawer: ethers.constants.AddressZero,
            token: ethers.constants.AddressZero,
            amount: ethers.BigNumber.from(0),
            timestamp: ethers.BigNumber.from(0),
          },
        ]),
        getPendingWithdrawalsLength: jest.fn().mockImplementation(async () => ethers.BigNumber.from(0)),
        withdrawalDelay: jest.fn().mockImplementation(async () => ethers.BigNumber.from(60 * 60 * 24)),
      };

      jest.spyOn(ethers, 'Contract').mockReturnValue(mockERC20ContractFlowRateNone as any);

      const result = await tokenBridge.getPendingWithdrawals(req);

      expect(result.pending).toBeDefined();
      expect(result.pending.length).toBe(0);
    });
  });

  describe('getFlowRateInfo', () => {
    let tokenBridge: TokenBridge;

    const token = '0x40b87d235A5B010a20A241F15797C9debf1ecd01';
    const capacity = ethers.BigNumber.from(500000);
    const depth = ethers.BigNumber.from(300000);
    const refillTime = ethers.BigNumber.from(5000);
    const refillRate = ethers.BigNumber.from(100000);
    const withdrawalDelay = ethers.BigNumber.from(60 * 60 * 24);
    const largeTxThreshold = ethers.BigNumber.from(300000);

    const mockERC20ContractFlowRate = {
      withdrawalQueueActivated: jest.fn().mockImplementation(async () => false),
      withdrawalDelay: jest.fn().mockImplementation(async () => withdrawalDelay),
      flowRateBuckets: jest.fn().mockImplementation(async () => ({
        capacity,
        depth,
        refillTime,
        refillRate,
      })),
      largeTransferThresholds: jest.fn().mockImplementation(async () => largeTxThreshold),
    };

    const voidRootProvider = new ethers.providers.JsonRpcProvider('x');
    const voidChildProvider = new ethers.providers.JsonRpcProvider('x');

    const bridgeConfig = new BridgeConfiguration({
      baseConfig: new ImmutableConfiguration({
        environment: Environment.SANDBOX,
      }),
      bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_TESTNET,
      rootProvider: voidRootProvider,
      childProvider: voidChildProvider,
    });

    beforeEach(() => {
      tokenBridge = new TokenBridge(bridgeConfig);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
    it('returns the flow rate info for a specific token', async () => {
      expect.assertions(7);
      const req = {
        tokens: [token],
      };

      jest.spyOn(ethers, 'Contract').mockReturnValue(mockERC20ContractFlowRate as any);

      const result = await tokenBridge.getFlowRateInfo(req);

      expect(result).toBeDefined();
      expect(result.withdrawalQueueActivated).toBe(false);
      expect(result.withdrawalDelay).toBe(withdrawalDelay.toNumber());
      expect(result.tokens[token].capacity).toStrictEqual(capacity);
      expect(result.tokens[token].depth).toStrictEqual(depth);
      expect(result.tokens[token].refillTime).toBe(refillTime.toNumber());
      expect(result.tokens[token].refillRate).toStrictEqual(refillRate);
    });

    it('returns the flow rate info for the NATIVE token', async () => {
      expect.assertions(7);
      const req = {
        tokens: ['NATIVE'],
      };

      jest.spyOn(ethers, 'Contract').mockReturnValue(mockERC20ContractFlowRate as any);

      const result = await tokenBridge.getFlowRateInfo(req);

      expect(result).toBeDefined();
      expect(result.withdrawalQueueActivated).toBe(false);
      expect(result.withdrawalDelay).toBe(withdrawalDelay.toNumber());
      expect(result.tokens['NATIVE'].capacity).toStrictEqual(capacity);
      expect(result.tokens['NATIVE'].depth).toStrictEqual(depth);
      expect(result.tokens['NATIVE'].refillTime).toBe(refillTime.toNumber());
      expect(result.tokens['NATIVE'].refillRate).toStrictEqual(refillRate);
    });

    it('returns the flow rate info for the multiple tokens', async () => {
      expect.assertions(15);
      const otherToken = '0x12345';
      const req = {
        tokens: ['NATIVE', token, otherToken],
      };

      const mockERC20ContractFlowRateMultiToken = {
        withdrawalQueueActivated: jest.fn().mockImplementation(async () => false),
        withdrawalDelay: jest.fn().mockImplementation(async () => withdrawalDelay),
        flowRateBuckets: jest.fn().mockImplementation(async () => ({
          capacity,
          depth,
          refillTime,
          refillRate,
        })),
        largeTransferThresholds: jest.fn().mockImplementation(async () => largeTxThreshold),
      };

      jest.spyOn(ethers, 'Contract').mockReturnValue(mockERC20ContractFlowRateMultiToken as any);

      const result = await tokenBridge.getFlowRateInfo(req);

      expect(result).toBeDefined();
      expect(result.withdrawalQueueActivated).toBe(false);
      expect(result.withdrawalDelay).toBe(withdrawalDelay.toNumber());
      expect(result.tokens['NATIVE'].capacity).toStrictEqual(capacity);
      expect(result.tokens['NATIVE'].depth).toStrictEqual(depth);
      expect(result.tokens['NATIVE'].refillTime).toBe(refillTime.toNumber());
      expect(result.tokens['NATIVE'].refillRate).toStrictEqual(refillRate);
      expect(result.tokens[token].capacity).toStrictEqual(capacity);
      expect(result.tokens[token].depth).toStrictEqual(depth);
      expect(result.tokens[token].refillTime).toBe(refillTime.toNumber());
      expect(result.tokens[token].refillRate).toStrictEqual(refillRate);
      expect(result.tokens[otherToken].capacity).toStrictEqual(capacity);
      expect(result.tokens[otherToken].depth).toStrictEqual(depth);
      expect(result.tokens[otherToken].refillTime).toBe(refillTime.toNumber());
      expect(result.tokens[otherToken].refillRate).toStrictEqual(refillRate);
    });
    it('returns the withdrawalQueueActivated as true ', async () => {
      expect.assertions(7);
      const req = {
        tokens: ['NATIVE'],
      };

      const mockERC20ContractFlowRateMultiToken = {
        withdrawalQueueActivated: jest.fn().mockImplementation(async () => true),
        withdrawalDelay: jest.fn().mockImplementation(async () => withdrawalDelay),
        flowRateBuckets: jest.fn().mockImplementation(async () => ({
          capacity,
          depth,
          refillTime,
          refillRate,
        })),
        largeTransferThresholds: jest.fn().mockImplementation(async () => largeTxThreshold),

      };

      jest.spyOn(ethers, 'Contract').mockReturnValue(mockERC20ContractFlowRateMultiToken as any);

      const result = await tokenBridge.getFlowRateInfo(req);

      expect(result).toBeDefined();
      expect(result.withdrawalQueueActivated).toBe(true);
      expect(result.withdrawalDelay).toBe(withdrawalDelay.toNumber());
      expect(result.tokens['NATIVE'].capacity).toStrictEqual(capacity);
      expect(result.tokens['NATIVE'].depth).toStrictEqual(depth);
      expect(result.tokens['NATIVE'].refillTime).toBe(refillTime.toNumber());
      expect(result.tokens['NATIVE'].refillRate).toStrictEqual(refillRate);
    });
  });

  describe('calculateBridgeFee', () => {
    let tokenBridge: TokenBridge;
    beforeEach(() => {
      const voidRootProvider = new ethers.providers.JsonRpcProvider('x');
      const voidChildProvider = new ethers.providers.JsonRpcProvider('x');
      const bridgeConfig = new BridgeConfiguration({
        baseConfig: new ImmutableConfiguration({
          environment: Environment.SANDBOX,
        }),
        bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_TESTNET,
        rootProvider: voidRootProvider,
        childProvider: voidChildProvider,
      });
      tokenBridge = new TokenBridge(bridgeConfig);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
    it('returns the bridge fee when no errors', async () => {
      expect.assertions(1);
      const feeResult = await tokenBridge['calculateBridgeFee'](
        ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
        ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
        500,
        1.1,
      );
      expect(feeResult.bridgeFee).toStrictEqual(ethers.BigNumber.from('100000000'));
    });
    it('throws an error when the sourceChainId can not be matched to an Axlear chainId', async () => {
      expect.assertions(2);
      try {
        await tokenBridge['calculateBridgeFee'](
          '100',
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
          500,
          1.1,
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.AXELAR_CHAIN_NOT_FOUND);
      }
    });
    it('throws an error when the destinationChainId can not be matched to an Axlear chainId', async () => {
      expect.assertions(2);
      try {
        await tokenBridge['calculateBridgeFee'](
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
          '100',
          500,
          1.1,
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.AXELAR_CHAIN_NOT_FOUND);
      }
    });
  });

  describe('getTokenMapping', () => {
    let tokenBridge: TokenBridge;

    const childETHToken = '0x111';
    const childUSDCToken = '0x222';
    const rootUSDCToken = '0x333';

    const voidRootProvider = new ethers.providers.JsonRpcProvider('x');
    const voidChildProvider = new ethers.providers.JsonRpcProvider('x');

    const bridgeConfig = new BridgeConfiguration({
      baseConfig: new ImmutableConfiguration({
        environment: Environment.SANDBOX,
      }),
      bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_TESTNET,
      rootProvider: voidRootProvider,
      childProvider: voidChildProvider,
    });

    const mockChildBridge = {
      childETHToken: jest.fn().mockImplementation(async () => childETHToken),
    };

    const mockRootBridgeIMX = {
      rootTokenToChildToken: jest.fn().mockImplementation(async () => bridgeConfig.bridgeContracts.rootChainIMX),
    };

    const mockRootBridgeUSDC = {
      rootTokenToChildToken: jest.fn().mockImplementation(async () => childUSDCToken),
    };

    beforeEach(() => {
      tokenBridge = new TokenBridge(bridgeConfig);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
    it('returns the mapping for Native ETH', async () => {
      expect.assertions(3);
      const req = {
        rootToken: 'NATIVE',
        rootChainId: bridgeConfig.bridgeInstance.rootChainID,
        childChainId: bridgeConfig.bridgeInstance.childChainID,
      };

      jest.spyOn(ethers, 'Contract').mockReturnValue(mockChildBridge as any);

      const result = await tokenBridge.getTokenMapping(req);

      expect(result).toBeDefined();
      expect(result.rootToken).toBe('NATIVE');
      expect(result.childToken).toBe(childETHToken);
    });

    it('returns the mapping for wETH', async () => {
      expect.assertions(3);
      const req = {
        rootToken: bridgeConfig.bridgeContracts.rootChainWrappedETH,
        rootChainId: bridgeConfig.bridgeInstance.rootChainID,
        childChainId: bridgeConfig.bridgeInstance.childChainID,
      };

      jest.spyOn(ethers, 'Contract').mockReturnValue(mockChildBridge as any);

      const result = await tokenBridge.getTokenMapping(req);

      expect(result).toBeDefined();
      expect(result.rootToken).toBe(bridgeConfig.bridgeContracts.rootChainWrappedETH);
      expect(result.childToken).toBe(childETHToken);
    });

    it('returns the mapping for wETH', async () => {
      expect.assertions(3);
      const req = {
        rootToken: bridgeConfig.bridgeContracts.rootChainWrappedETH,
        rootChainId: bridgeConfig.bridgeInstance.rootChainID,
        childChainId: bridgeConfig.bridgeInstance.childChainID,
      };

      jest.spyOn(ethers, 'Contract').mockReturnValue(mockChildBridge as any);

      const result = await tokenBridge.getTokenMapping(req);

      expect(result).toBeDefined();
      expect(result.rootToken).toBe(bridgeConfig.bridgeContracts.rootChainWrappedETH);
      expect(result.childToken).toBe(childETHToken);
    });

    it('returns the mapping for IMX', async () => {
      expect.assertions(3);
      const req = {
        rootToken: bridgeConfig.bridgeContracts.rootChainIMX,
        rootChainId: bridgeConfig.bridgeInstance.rootChainID,
        childChainId: bridgeConfig.bridgeInstance.childChainID,
      };

      jest.spyOn(ethers, 'Contract').mockReturnValue(mockRootBridgeIMX as any);

      const result = await tokenBridge.getTokenMapping(req);

      expect(result).toBeDefined();
      expect(result.rootToken).toBe(bridgeConfig.bridgeContracts.rootChainIMX);
      expect(result.childToken).toBe('NATIVE');
    });

    it('returns the mapping for USDC', async () => {
      expect.assertions(3);
      const req = {
        rootToken: rootUSDCToken,
        rootChainId: bridgeConfig.bridgeInstance.rootChainID,
        childChainId: bridgeConfig.bridgeInstance.childChainID,
      };

      jest.spyOn(ethers, 'Contract').mockReturnValue(mockRootBridgeUSDC as any);

      const result = await tokenBridge.getTokenMapping(req);

      expect(result).toBeDefined();
      expect(result.rootToken).toBe(rootUSDCToken);
      expect(result.childToken).toBe(childUSDCToken);
    });
  });
});
