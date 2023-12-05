/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/naming-convention */
import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { TokenBridge } from 'tokenBridge';
import { BridgeConfiguration } from 'config';
import { ETH_SEPOLIA_TO_ZKEVM_DEVNET } from 'constants/bridges';
import { BridgeFeeActions, BridgeTxRequest, BridgeTxResponse } from 'types';
import { ethers } from 'ethers';
import { BridgeError, BridgeErrorType } from 'errors';

jest.mock('@axelar-network/axelarjs-sdk', () => ({
  AxelarQueryAPI: jest.fn().mockImplementation(() => ({
    estimateGasFee: jest.fn().mockReturnValue({
      executionFeeWithMultiplier: ethers.utils.parseUnits('0.0001', 18),
      baseFee: ethers.utils.parseUnits('0.001', 18),
    }),
  })),
  Environment: {
    DEVNET: 'devnet',
    TESTNET: 'testnet',
    MAINNET: 'mainnet',
  },
}));

jest.mock('axios', () => ({
  post: jest.fn().mockReturnValue({
    data: '100000000',
  }),
}));

describe('Token Bridge', () => {
  it('Constructor works correctly', async () => {
    const voidRootProvider = new ethers.providers.JsonRpcProvider('x');
    const voidChildProvider = new ethers.providers.JsonRpcProvider('x');

    const bridgeConfig = new BridgeConfiguration({
      baseConfig: new ImmutableConfiguration({
        environment: Environment.SANDBOX,
      }),
      bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_DEVNET,
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
        bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_DEVNET,
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
        sourceChainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.rootChainID,
        destinationChainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.childChainID,
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
        sourceChainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.rootChainID,
        destinationChainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.childChainID,
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
          sourceChainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.rootChainID,
          destinationChainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.childChainID,
        },
      );
      expect(result.unsignedTx).toBeNull();
    });
  });

  describe('getUnsignedBridgeTx', () => {
    const voidRootProvider = new ethers.providers.JsonRpcProvider('x');
    const voidChildProvider = new ethers.providers.JsonRpcProvider('x');

    const originalValidateDepositArgs = TokenBridge.prototype['validateDepositArgs'];
    const originalValidateChainConfiguration = TokenBridge.prototype['validateChainConfiguration'];
    const originalGetFee = TokenBridge.prototype['getFee'];

    const sourceChainGas:ethers.BigNumber = ethers.utils.parseUnits('0.000001', 18);
    const destinationChainGas:ethers.BigNumber = ethers.utils.parseUnits('0.000001', 18);
    const bridgeFee:ethers.BigNumber = ethers.utils.parseUnits('0.0001', 18);
    const imtblFee:ethers.BigNumber = ethers.BigNumber.from(0);
    const totalFees:ethers.BigNumber = sourceChainGas.add(bridgeFee).add(imtblFee);

    let tokenBridge: TokenBridge;
    let bridgeConfig: BridgeConfiguration;
    beforeEach(() => {
      bridgeConfig = new BridgeConfiguration({
        baseConfig: new ImmutableConfiguration({
          environment: Environment.SANDBOX,
        }),
        bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_DEVNET,
        rootProvider: voidRootProvider,
        childProvider: voidChildProvider,
      });
      tokenBridge = new TokenBridge(bridgeConfig);
      jest.spyOn(TokenBridge.prototype as any, 'validateDepositArgs')
        .mockImplementation(async () => 'Valid');
      jest.spyOn(TokenBridge.prototype as any, 'validateChainConfiguration')
        .mockImplementation(async () => 'Valid');
      jest.spyOn(TokenBridge.prototype as any, 'getFee')
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
      TokenBridge.prototype['getFee'] = originalGetFee;
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
        sourceChainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.rootChainID,
        destinationChainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.childChainID,
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
        sourceChainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.rootChainID,
        destinationChainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.childChainID,
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
        sourceChainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.rootChainID,
        destinationChainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.childChainID,
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
        bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_DEVNET,
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
          ETH_SEPOLIA_TO_ZKEVM_DEVNET.rootChainID,
          ETH_SEPOLIA_TO_ZKEVM_DEVNET.childChainID,
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
          ETH_SEPOLIA_TO_ZKEVM_DEVNET.rootChainID,
          ETH_SEPOLIA_TO_ZKEVM_DEVNET.childChainID,
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
          ETH_SEPOLIA_TO_ZKEVM_DEVNET.rootChainID,
          ETH_SEPOLIA_TO_ZKEVM_DEVNET.childChainID,
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
          ETH_SEPOLIA_TO_ZKEVM_DEVNET.rootChainID,
          ETH_SEPOLIA_TO_ZKEVM_DEVNET.childChainID,
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
          ETH_SEPOLIA_TO_ZKEVM_DEVNET.rootChainID,
          ETH_SEPOLIA_TO_ZKEVM_DEVNET.childChainID,
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
          ETH_SEPOLIA_TO_ZKEVM_DEVNET.rootChainID,
          ETH_SEPOLIA_TO_ZKEVM_DEVNET.childChainID,
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
        bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_DEVNET,
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
          ETH_SEPOLIA_TO_ZKEVM_DEVNET.rootChainID,
          ETH_SEPOLIA_TO_ZKEVM_DEVNET.childChainID,
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
          ETH_SEPOLIA_TO_ZKEVM_DEVNET.childChainID,
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
          ETH_SEPOLIA_TO_ZKEVM_DEVNET.rootChainID,
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
          ETH_SEPOLIA_TO_ZKEVM_DEVNET.rootChainID,
          ETH_SEPOLIA_TO_ZKEVM_DEVNET.rootChainID,
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
        getNetwork: jest.fn().mockReturnValue({ chainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.rootChainID }),
      } as unknown as ethers.providers.Web3Provider;
      const mockChildProvider = {
        getNetwork: jest.fn().mockReturnValue({ chainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.childChainID }),
      } as unknown as ethers.providers.Web3Provider;

      const bridgeConfig = new BridgeConfiguration({
        baseConfig: new ImmutableConfiguration({
          environment: Environment.SANDBOX,
        }),
        bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_DEVNET,
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
        getNetwork: jest.fn().mockReturnValue({ chainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.childChainID }),
      } as unknown as ethers.providers.Web3Provider;

      const bridgeConfig = new BridgeConfiguration({
        baseConfig: new ImmutableConfiguration({
          environment: Environment.SANDBOX,
        }),
        bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_DEVNET,
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
        getNetwork: jest.fn().mockReturnValue({ chainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.rootChainID }),
      } as unknown as ethers.providers.Web3Provider;
      const mockChildProvider = {
        getNetwork: jest.fn().mockReturnValue({ chainId: '100' }),
      } as unknown as ethers.providers.Web3Provider;

      const bridgeConfig = new BridgeConfiguration({
        baseConfig: new ImmutableConfiguration({
          environment: Environment.SANDBOX,
        }),
        bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_DEVNET,
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

    const sourceChainGas:ethers.BigNumber = ethers.utils.parseUnits('0.000001', 18);
    const destinationChainGas:ethers.BigNumber = ethers.utils.parseUnits('0.000001', 18);
    const validatorFee:ethers.BigNumber = ethers.utils.parseUnits('0.0001', 18);
    const bridgeFee:ethers.BigNumber = destinationChainGas.add(validatorFee);
    const imtblFee:ethers.BigNumber = ethers.BigNumber.from(0);
    const totalFees:ethers.BigNumber = sourceChainGas.add(bridgeFee).add(imtblFee);

    beforeEach(() => {
      const voidRootProvider = new ethers.providers.JsonRpcProvider('x');
      const voidChildProvider = new ethers.providers.JsonRpcProvider('x');
      const bridgeConfig = new BridgeConfiguration({
        baseConfig: new ImmutableConfiguration({
          environment: Environment.SANDBOX,
        }),
        bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_DEVNET,
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
    });
    it('returns the deposit fees', async () => {
      expect.assertions(5);
      const result = await tokenBridge.getFee(
        {
          action: BridgeFeeActions.DEPOSIT,
          gasMultiplier: 1.1,
          sourceChainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.rootChainID,
          destinationChainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.childChainID,
        },
      );

      expect(result).not.toBeNull();
      expect(result.sourceChainGas).toStrictEqual(sourceChainGas);
      expect(result.bridgeFee).toStrictEqual(bridgeFee);
      expect(result.imtblFee).toStrictEqual(imtblFee);
      expect(result.totalFees).toStrictEqual(totalFees);
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
        bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_DEVNET,
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
        ETH_SEPOLIA_TO_ZKEVM_DEVNET.rootChainID,
        ETH_SEPOLIA_TO_ZKEVM_DEVNET.childChainID,
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
          ETH_SEPOLIA_TO_ZKEVM_DEVNET.childChainID,
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
          ETH_SEPOLIA_TO_ZKEVM_DEVNET.rootChainID,
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
});
