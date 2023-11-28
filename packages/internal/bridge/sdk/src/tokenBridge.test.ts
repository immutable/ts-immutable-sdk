import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { TokenBridge } from 'tokenBridge';
import { BridgeConfiguration } from 'config';
import { ETH_SEPOLIA_TO_ZKEVM_DEVNET } from 'constants/bridges';
import { BridgeFeeMethods, BridgeTxRequest, BridgeTxResponse } from 'types';
import { ethers } from 'ethers';
import { BridgeError, BridgeErrorType } from 'errors';

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
      tokenBridge = new TokenBridge(bridgeConfig);
    });

    afterEach(() => {
      jest.clearAllMocks();
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

  describe('these should actually test validateChainConfiguration not getUnsignedApproveBridgeTx ', () => {
    let tokenBridge: TokenBridge;
    const mockERC20Contract = {
      allowance: jest.fn(),
      interface: {
        encodeFunctionData: jest.fn(),
      },
    };

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
      tokenBridge = new TokenBridge(bridgeConfig);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
    it.skip('throws an error when senderAddress is not a valid address and the token is ERC20', async () => {
      expect.assertions(2);
      try {
        await tokenBridge.getUnsignedApproveBridgeTx(
          {
            token: '0x1234567890123456789012345678901234567890',
            senderAddress: 'invalidAddress',
            amount: ethers.utils.parseUnits('0.01', 18),
            sourceChainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.rootChainID,
            destinationChainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.childChainID,
          },
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.INVALID_ADDRESS);
      }
    });
    it.skip('throws an error when senderAddress is not a valid address and the token is NATIVE', async () => {
      expect.assertions(2);
      try {
        await tokenBridge.getUnsignedApproveBridgeTx({
          token: 'NATIVE',
          senderAddress: 'invalidAddress',
          amount: ethers.utils.parseUnits('0.01', 18),
          sourceChainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.rootChainID,
          destinationChainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.childChainID,
        });
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.INVALID_ADDRESS);
      }
    });
    it.skip('throws an error when token is not a valid address', async () => {
      expect.assertions(2);
      try {
        await tokenBridge.getUnsignedApproveBridgeTx(
          {
            token: 'invalidToken',
            senderAddress: '0x1234567890123456789012345678901234567890',
            amount: ethers.utils.parseUnits('0.01', 18),
            sourceChainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.rootChainID,
            destinationChainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.childChainID,
          },
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.INVALID_ADDRESS);
      }
    });
    it.skip('throws an error when amount is less than or equal to 0 and token is ERC20', async () => {
      expect.assertions(2);
      try {
        await tokenBridge.getUnsignedApproveBridgeTx(
          {
            token: '0x1234567890123456789012345678901234567890',
            senderAddress: '0x1234567890123456789012345678901234567890',
            amount: ethers.BigNumber.from(0),
            sourceChainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.rootChainID,
            destinationChainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.childChainID,
          },
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.INVALID_AMOUNT);
      }
    });
    it.skip('throws an error when amount is less than or equal to 0 and token is NATIVE', async () => {
      expect.assertions(2);
      try {
        await tokenBridge.getUnsignedApproveBridgeTx(
          {
            token: 'NATIVE',
            senderAddress: '0x1234567890123456789012345678901234567890',
            amount: ethers.BigNumber.from(0),
            sourceChainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.rootChainID,
            destinationChainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.childChainID,
          },
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.INVALID_AMOUNT);
      }
    });
    it.skip('throws an error when the sourceChainId is not one of the ones set in the initializer', async () => {
      expect.assertions(2);
      try {
        await tokenBridge.getUnsignedApproveBridgeTx(
          {
            token: 'NATIVE',
            senderAddress: '0x1234567890123456789012345678901234567890',
            amount: ethers.utils.parseUnits('100', 18),
            sourceChainId: '100',
            destinationChainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.childChainID,
          },
        );
        console.log('after await');
      } catch (error: any) {
        console.log('after catch');

        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.INVALID_SOURCE_CHAIN_ID);
      }
    });
    it.skip('throws an error when the destinationChainId is not one of the ones set in the initializer', async () => {
      expect.assertions(2);
      try {
        await tokenBridge.getUnsignedApproveBridgeTx(
          {
            token: 'NATIVE',
            senderAddress: '0x1234567890123456789012345678901234567890',
            amount: ethers.utils.parseUnits('100', 18),
            sourceChainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.rootChainID,
            destinationChainId: '100',
          },
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.INVALID_DESTINATION_CHAIN_ID);
      }
    });
    it.skip('throws an error when the sourceChainId is the same as the  destinationChainId', async () => {
      expect.assertions(2);
      try {
        await tokenBridge.getUnsignedApproveBridgeTx(
          {
            token: 'NATIVE',
            senderAddress: '0x1234567890123456789012345678901234567890',
            amount: ethers.utils.parseUnits('100', 18),
            sourceChainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.rootChainID,
            destinationChainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.rootChainID,
          },
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.CHAIN_IDS_MATCH);
      }
    });
  });

  describe('getUnsignedBridgeTx', () => {
    const voidRootProvider = new ethers.providers.JsonRpcProvider('x');
    const voidChildProvider = new ethers.providers.JsonRpcProvider('x');

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
      };
      const response: BridgeTxResponse = await tokenBridge.getUnsignedBridgeTx(request);

      expect(response.unsignedTx.to).toBe(
        bridgeConfig.bridgeContracts.rootERC20BridgeFlowRate,
      );
      expect(response.unsignedTx.value).toBe(0);
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
      };

      const response: BridgeTxResponse = await tokenBridge.getUnsignedBridgeTx(request);
      expect(response.unsignedTx.to).toBe(bridgeConfig.bridgeContracts.rootERC20BridgeFlowRate);
      expect(response.unsignedTx.value).toBe(amount);
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
      };
      const response: BridgeTxResponse = await tokenBridge.getUnsignedBridgeTx(request);
      expect(response.unsignedTx.to).toBe(
        bridgeConfig.bridgeContracts.rootERC20BridgeFlowRate,
      );
      expect(response.unsignedTx.value).toBe(0);
      expect(response.unsignedTx.data).not.toBeNull();
    });
  });

  describe('these should actually test validateDepositArgs not getUnsignedBridgeTx', () => {
    const voidRootProvider = new ethers.providers.JsonRpcProvider('x');
    const voidChildProvider = new ethers.providers.JsonRpcProvider('x');

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
    });
    it.skip('ERC20 token with invalid receipient address fails', async () => {
      expect.assertions(1);
      const recipientAddress = 'zzzz3095171469a0db24D9Fb9C789D62dF22BBAfa816';
      const token = '0x2f14582947E292a2eCd20C430B46f2d27CFE213c';
      const amount = ethers.utils.parseUnits('0.01', 18);
      const request: BridgeTxRequest = {
        senderAddress: recipientAddress,
        recipientAddress,
        amount,
        token,
        sourceChainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.rootChainID,
        destinationChainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.childChainID,
      };

      await expect(async () => {
        await tokenBridge.getUnsignedBridgeTx(request);
      }).rejects.toThrow(
        new BridgeError(
          'address zzzz3095171469a0db24D9Fb9C789D62dF22BBAfa816 is not a valid address',
          BridgeErrorType.INVALID_ADDRESS,
        ),
      );
    });
    it.skip('NATIVE token with invalid receipient address fails', async () => {
      expect.assertions(1);
      const recipientAddress = 'zzzz3095171469a0db24D9Fb9C789D62dF22BBAfa816';
      const token = 'NATIVE';
      const amount = ethers.utils.parseUnits('0.01', 18);
      const request: BridgeTxRequest = {
        senderAddress: recipientAddress,
        recipientAddress,
        amount,
        token,
        sourceChainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.rootChainID,
        destinationChainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.childChainID,
      };

      await expect(async () => {
        await tokenBridge.getUnsignedBridgeTx(request);
      }).rejects.toThrow(
        new BridgeError(
          'address zzzz3095171469a0db24D9Fb9C789D62dF22BBAfa816 is not a valid address',
          BridgeErrorType.INVALID_ADDRESS,
        ),
      );
    });
    it.skip('ERC20 token with invalid token address fails', async () => {
      expect.assertions(1);
      const recipientAddress = '0x3095171469a0db24D9Fb9C789D62dF22BBAfa816';
      const token = 'zzzzf14582947E292a2eCd20C430B46f2d27CFE213c';
      const amount = ethers.utils.parseUnits('0.01', 18);
      const request: BridgeTxRequest = {
        senderAddress: recipientAddress,
        recipientAddress,
        amount,
        token,
        sourceChainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.rootChainID,
        destinationChainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.childChainID,
      };

      await expect(async () => {
        await tokenBridge.getUnsignedBridgeTx(request);
      }).rejects.toThrow(
        new BridgeError(
          'token address zzzzf14582947E292a2eCd20C430B46f2d27CFE213c is not a valid address',
          BridgeErrorType.INVALID_ADDRESS,
        ),
      );
    });

    it.skip('ERC20 token with 0 amount fails', async () => {
      expect.assertions(1);
      const recipientAddress = '0x3095171469a0db24D9Fb9C789D62dF22BBAfa816';
      const token = '0x2f14582947E292a2eCd20C430B46f2d27CFE213c';
      const amount = ethers.utils.parseUnits('0', 18);
      const request: BridgeTxRequest = {
        senderAddress: recipientAddress,
        recipientAddress,
        amount,
        token,
        sourceChainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.rootChainID,
        destinationChainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.childChainID,
      };

      await expect(async () => {
        await tokenBridge.getUnsignedBridgeTx(request);
      }).rejects.toThrow(
        new BridgeError(
          'deposit amount 0 is invalid',
          BridgeErrorType.INVALID_AMOUNT,
        ),
      );
    });

    it.skip('NATIVE token with 0 amount fails', async () => {
      expect.assertions(1);
      const recipientAddress = '0x3095171469a0db24D9Fb9C789D62dF22BBAfa816';
      const token = 'NATIVE';
      const amount = ethers.utils.parseUnits('0', 18);
      const request: BridgeTxRequest = {
        senderAddress: recipientAddress,
        recipientAddress,
        amount,
        token,
        sourceChainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.rootChainID,
        destinationChainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.childChainID,
      };

      await expect(async () => {
        await tokenBridge.getUnsignedBridgeTx(request);
      }).rejects.toThrow(
        new BridgeError(
          'deposit amount 0 is invalid',
          BridgeErrorType.INVALID_AMOUNT,
        ),
      );
    });
    it.skip('ERC20 token with negative amount fails', async () => {
      expect.assertions(1);
      const recipientAddress = '0x3095171469a0db24D9Fb9C789D62dF22BBAfa816';
      const token = '0x2f14582947E292a2eCd20C430B46f2d27CFE213c';
      const amount = ethers.utils.parseUnits('-1', 18);
      const request: BridgeTxRequest = {
        senderAddress: recipientAddress,
        recipientAddress,
        amount,
        token,
        sourceChainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.rootChainID,
        destinationChainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.childChainID,
      };

      await expect(async () => {
        await tokenBridge.getUnsignedBridgeTx(request);
      }).rejects.toThrow(
        new BridgeError(
          'deposit amount -1000000000000000000 is invalid',
          BridgeErrorType.INVALID_AMOUNT,
        ),
      );
    });
    it.skip('NATIVE token with negative amount fails', async () => {
      expect.assertions(1);
      const recipientAddress = '0x3095171469a0db24D9Fb9C789D62dF22BBAfa816';
      const token = 'NATIVE';
      const amount = ethers.utils.parseUnits('-1', 18);
      const request: BridgeTxRequest = {
        senderAddress: recipientAddress,
        recipientAddress,
        amount,
        token,
        sourceChainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.rootChainID,
        destinationChainId: ETH_SEPOLIA_TO_ZKEVM_DEVNET.childChainID,
      };

      await expect(async () => {
        await tokenBridge.getUnsignedBridgeTx(request);
      }).rejects.toThrow(
        new BridgeError(
          'deposit amount -1000000000000000000 is invalid',
          BridgeErrorType.INVALID_AMOUNT,
        ),
      );
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
        .mockImplementation(async () => ethers.BigNumber.from(100));
      tokenBridge = new TokenBridge(bridgeConfig);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
    it('returns the deposit fees', async () => {
      expect.assertions(1);
      const result = await tokenBridge.getFee(
        {
          method: BridgeFeeMethods.DEPOSIT,
        },
      );
      expect(result).not.toBeNull();
    });
  });
});
