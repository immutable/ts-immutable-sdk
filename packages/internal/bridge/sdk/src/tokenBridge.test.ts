import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { TokenBridge } from 'tokenBridge';
import { BridgeConfiguration } from 'config';
import { ETH_SEPOLIA_TO_ZKEVM_DEVNET } from 'constants/bridges';
import { BridgeDepositRequest, BridgeDepositResponse } from 'types';
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

  describe('getUnsignedApproveRootBridgeTx', () => {
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
      tokenBridge = new TokenBridge(bridgeConfig);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
    it('returns the unsigned approval transaction when the allowance is less than the deposit amount', async () => {
      expect.assertions(5);
      const allowance = ethers.utils.parseUnits('50', 18);
      const depositAmount = ethers.utils.parseUnits('100', 18);

      mockERC20Contract.allowance.mockResolvedValue(allowance);
      mockERC20Contract.interface.encodeFunctionData.mockResolvedValue('0xdata');

      const req = {
        depositorAddress: '0x3095171469a0db24D9Fb9C789D62dF22BBAfa816',
        token: '0x2f14582947E292a2eCd20C430B46f2d27CFE213c',
        depositAmount,
      };

      const result = await tokenBridge.getUnsignedApproveDepositBridgeTx(req);
      expect(result.unsignedTx).toBeDefined();
      expect(result.unsignedTx?.data).toBe('0xdata');
      expect(result.unsignedTx?.to).toBe(req.token);
      expect(result.unsignedTx?.from).toBe(req.depositorAddress);
      expect(result.unsignedTx?.value).toBe(0);
    });

    it('return null tx when the allowance is greater than the deposit amount', async () => {
      expect.assertions(1);
      const allowance = ethers.utils.parseUnits('200', 18);
      const depositAmount = ethers.utils.parseUnits('100', 18);

      mockERC20Contract.allowance.mockResolvedValue(allowance);
      mockERC20Contract.interface.encodeFunctionData.mockResolvedValue('0xdata');

      const req = {
        depositorAddress: '0x3095171469a0db24D9Fb9C789D62dF22BBAfa816',
        token: '0x2f14582947E292a2eCd20C430B46f2d27CFE213c',
        depositAmount,
      };

      const result = await tokenBridge.getUnsignedApproveDepositBridgeTx(req);
      expect(result.unsignedTx).toBeNull();
    });

    it('return null tx when the token is NATIVE', async () => {
      expect.assertions(1);
      const result = await tokenBridge.getUnsignedApproveDepositBridgeTx({ token: 'NATIVE', depositorAddress: '0x3095171469a0db24D9Fb9C789D62dF22BBAfa816', depositAmount: ethers.utils.parseUnits('0.01', 18) });
      expect(result.unsignedTx).toBeNull();
    });
    it('throws an error when depositorAddress is not a valid address and the token is ERC20', async () => {
      expect.assertions(2);
      try {
        await tokenBridge.getUnsignedApproveDepositBridgeTx({ token: '0x1234567890123456789012345678901234567890', depositorAddress: 'invalidAddress', depositAmount: ethers.utils.parseUnits('0.01', 18) });
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.INVALID_ADDRESS);
      }
    });
    it('throws an error when depositorAddress is not a valid address and the token is NATIVE', async () => {
      expect.assertions(2);
      try {
        await tokenBridge.getUnsignedApproveDepositBridgeTx({ token: 'NATIVE', depositorAddress: 'invalidAddress', depositAmount: ethers.utils.parseUnits('0.01', 18) });
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.INVALID_ADDRESS);
      }
    });
    it('throws an error when token is not a valid address', async () => {
      expect.assertions(2);
      try {
        await tokenBridge.getUnsignedApproveDepositBridgeTx({ token: 'invalidToken', depositorAddress: '0x1234567890123456789012345678901234567890', depositAmount: ethers.utils.parseUnits('0.01', 18) });
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.INVALID_ADDRESS);
      }
    });
    it('throws an error when depositAmount is less than or equal to 0 and token is ERC20', async () => {
      expect.assertions(2);
      try {
        await tokenBridge.getUnsignedApproveDepositBridgeTx({ token: '0x1234567890123456789012345678901234567890', depositorAddress: '0x1234567890123456789012345678901234567890', depositAmount: ethers.BigNumber.from(0) });
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.INVALID_AMOUNT);
      }
    });
    it('throws an error when depositAmount is less than or equal to 0 and token is NATIVE', async () => {
      expect.assertions(2);
      try {
        await tokenBridge.getUnsignedApproveDepositBridgeTx({ token: 'NATIVE', depositorAddress: '0x1234567890123456789012345678901234567890', depositAmount: ethers.BigNumber.from(0) });
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.INVALID_AMOUNT);
      }
    });
  });

  describe('getUnsignedDepositTokenTx', () => {
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
    });

    it('ERC20 token with valid arguments is successful', async () => {
      expect.assertions(3);
      const recipientAddress = '0x3095171469a0db24D9Fb9C789D62dF22BBAfa816';
      const token = '0x2f14582947E292a2eCd20C430B46f2d27CFE213c';
      const depositAmount = ethers.utils.parseUnits('0.01', 18);
      const request: BridgeDepositRequest = {
        depositAmount,
        recipientAddress,
        token,
      };
      const response: BridgeDepositResponse = await tokenBridge.getUnsignedDepositTx(request);
      expect(response.unsignedTx.to).toBe(
        bridgeConfig.bridgeContracts.rootChainERC20Predicate,
      );
      expect(response.unsignedTx.value).toBe(0);
      expect(response.unsignedTx.data).not.toBeNull();
    });

    it('Native token with valid arguments is successful', async () => {
      expect.assertions(3);
      const recipientAddress = '0x3095171469a0db24D9Fb9C789D62dF22BBAfa816';
      const token = 'NATIVE';
      const depositAmount = ethers.utils.parseUnits('0.01', 18);
      const request: BridgeDepositRequest = {
        depositAmount,
        recipientAddress,
        token,
      };

      const response: BridgeDepositResponse = await tokenBridge.getUnsignedDepositTx(request);
      expect(response.unsignedTx.to).toBe(bridgeConfig.bridgeContracts.rootChainERC20Predicate);
      expect(response.unsignedTx.value).toBe(depositAmount);
      expect(response.unsignedTx.data).not.toBeNull();
    });

    it('ERC20 token with no-prefix addresses is successful', async () => {
      expect.assertions(3);
      const recipientAddress = '3095171469a0db24D9Fb9C789D62dF22BBAfa816';
      const token = '2f14582947E292a2eCd20C430B46f2d27CFE213c';
      const depositAmount = ethers.utils.parseUnits('0.01', 18);
      const request: BridgeDepositRequest = {
        depositAmount,
        recipientAddress,
        token,
      };
      const response: BridgeDepositResponse = await tokenBridge.getUnsignedDepositTx(request);
      expect(response.unsignedTx.to).toBe(
        bridgeConfig.bridgeContracts.rootChainERC20Predicate,
      );
      expect(response.unsignedTx.value).toBe(0);
      expect(response.unsignedTx.data).not.toBeNull();
    });

    it('ERC20 token with invalid receipient address fails', async () => {
      expect.assertions(1);
      const recipientAddress = 'zzzz3095171469a0db24D9Fb9C789D62dF22BBAfa816';
      const token = '0x2f14582947E292a2eCd20C430B46f2d27CFE213c';
      const depositAmount = ethers.utils.parseUnits('0.01', 18);
      const request: BridgeDepositRequest = {
        depositAmount,
        recipientAddress,
        token,
      };

      await expect(async () => {
        await tokenBridge.getUnsignedDepositTx(request);
      }).rejects.toThrow(
        new BridgeError(
          'address zzzz3095171469a0db24D9Fb9C789D62dF22BBAfa816 is not a valid address',
          BridgeErrorType.INVALID_ADDRESS,
        ),
      );
    });
    it('NATIVE token with invalid receipient address fails', async () => {
      expect.assertions(1);
      const recipientAddress = 'zzzz3095171469a0db24D9Fb9C789D62dF22BBAfa816';
      const token = 'NATIVE';
      const depositAmount = ethers.utils.parseUnits('0.01', 18);
      const request: BridgeDepositRequest = {
        depositAmount,
        recipientAddress,
        token,
      };

      await expect(async () => {
        await tokenBridge.getUnsignedDepositTx(request);
      }).rejects.toThrow(
        new BridgeError(
          'address zzzz3095171469a0db24D9Fb9C789D62dF22BBAfa816 is not a valid address',
          BridgeErrorType.INVALID_ADDRESS,
        ),
      );
    });
    it('ERC20 token with invalid token address fails', async () => {
      expect.assertions(1);
      const recipientAddress = '0x3095171469a0db24D9Fb9C789D62dF22BBAfa816';
      const token = 'zzzzf14582947E292a2eCd20C430B46f2d27CFE213c';
      const depositAmount = ethers.utils.parseUnits('0.01', 18);
      const request: BridgeDepositRequest = {
        depositAmount,
        recipientAddress,
        token,
      };

      await expect(async () => {
        await tokenBridge.getUnsignedDepositTx(request);
      }).rejects.toThrow(
        new BridgeError(
          'token address zzzzf14582947E292a2eCd20C430B46f2d27CFE213c is not a valid address',
          BridgeErrorType.INVALID_ADDRESS,
        ),
      );
    });

    it('ERC20 token with 0 amount fails', async () => {
      expect.assertions(1);
      const recipientAddress = '0x3095171469a0db24D9Fb9C789D62dF22BBAfa816';
      const token = '0x2f14582947E292a2eCd20C430B46f2d27CFE213c';
      const depositAmount = ethers.utils.parseUnits('0', 18);
      const request: BridgeDepositRequest = {
        depositAmount,
        recipientAddress,
        token,
      };

      await expect(async () => {
        await tokenBridge.getUnsignedDepositTx(request);
      }).rejects.toThrow(
        new BridgeError(
          'deposit amount 0 is invalid',
          BridgeErrorType.INVALID_AMOUNT,
        ),
      );
    });

    it('NATIVE token with 0 amount fails', async () => {
      expect.assertions(1);
      const recipientAddress = '0x3095171469a0db24D9Fb9C789D62dF22BBAfa816';
      const token = 'NATIVE';
      const depositAmount = ethers.utils.parseUnits('0', 18);
      const request: BridgeDepositRequest = {
        depositAmount,
        recipientAddress,
        token,
      };

      await expect(async () => {
        await tokenBridge.getUnsignedDepositTx(request);
      }).rejects.toThrow(
        new BridgeError(
          'deposit amount 0 is invalid',
          BridgeErrorType.INVALID_AMOUNT,
        ),
      );
    });
    it('ERC20 token with negative amount fails', async () => {
      expect.assertions(1);
      const recipientAddress = '0x3095171469a0db24D9Fb9C789D62dF22BBAfa816';
      const token = '0x2f14582947E292a2eCd20C430B46f2d27CFE213c';
      const depositAmount = ethers.utils.parseUnits('-1', 18);
      const request: BridgeDepositRequest = {
        depositAmount,
        recipientAddress,
        token,
      };

      await expect(async () => {
        await tokenBridge.getUnsignedDepositTx(request);
      }).rejects.toThrow(
        new BridgeError(
          'deposit amount -1000000000000000000 is invalid',
          BridgeErrorType.INVALID_AMOUNT,
        ),
      );
    });
    it('NATIVE token with negative amount fails', async () => {
      expect.assertions(1);
      const recipientAddress = '0x3095171469a0db24D9Fb9C789D62dF22BBAfa816';
      const token = 'NATIVE';
      const depositAmount = ethers.utils.parseUnits('-1', 18);
      const request: BridgeDepositRequest = {
        depositAmount,
        recipientAddress,
        token,
      };

      await expect(async () => {
        await tokenBridge.getUnsignedDepositTx(request);
      }).rejects.toThrow(
        new BridgeError(
          'deposit amount -1000000000000000000 is invalid',
          BridgeErrorType.INVALID_AMOUNT,
        ),
      );
    });
  });
});
