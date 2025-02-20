import { ImmutableConfiguration, Environment } from '@imtbl/config';
import {
  BrowserProvider, Contract, ethers, JsonRpcProvider, parseUnits,
} from 'ethers';
import { BridgeConfiguration } from '../config';
import { ETH_SEPOLIA_TO_ZKEVM_TESTNET, NATIVE, childETHs } from '../constants/bridges';
import { BridgeError, BridgeErrorType } from '../errors';
import { BridgeFeeActions } from '../types';
import {
  checkReceiver, validateBridgeReqArgs, validateChainConfiguration, validateChainIds,
  validateGetFee,
} from './validation';

describe('Validation', () => {
  describe('validateChainConfiguration', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('does not throw an error when everything setup correctly', async () => {
      const mockRootProvider = {
        getNetwork: jest.fn().mockReturnValue({ chainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID }),
      } as unknown as BrowserProvider;
      const mockChildProvider = {
        getNetwork: jest.fn().mockReturnValue({ chainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID }),
      } as unknown as BrowserProvider;

      const bridgeConfig = new BridgeConfiguration({
        baseConfig: new ImmutableConfiguration({
          environment: Environment.SANDBOX,
        }),
        bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_TESTNET,
        rootProvider: mockRootProvider,
        childProvider: mockChildProvider,
      });
      try {
        await validateChainConfiguration(bridgeConfig);
      } catch (error: any) {
        throw new Error(`Should not have thrown an error, but threw ${error}`);
      }
    });

    it('throws an error when the rootProvider chainId is not the one set in the config', async () => {
      const mockRootProvider = {
        getNetwork: jest.fn().mockReturnValue({ chainId: 100 }),
      } as unknown as BrowserProvider;
      const mockChildProvider = {
        getNetwork: jest.fn().mockReturnValue({ chainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID }),
      } as unknown as BrowserProvider;

      const bridgeConfig = new BridgeConfiguration({
        baseConfig: new ImmutableConfiguration({
          environment: Environment.SANDBOX,
        }),
        bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_TESTNET,
        rootProvider: mockRootProvider,
        childProvider: mockChildProvider,
      });

      expect.assertions(2);
      try {
        await validateChainConfiguration(bridgeConfig);
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.UNSUPPORTED_ERROR);
      }
    });

    it('throws an error when the childProvider chainId is not the one set in the config', async () => {
      const mockRootProvider = {
        getNetwork: jest.fn().mockReturnValue({ chainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID }),
      } as unknown as BrowserProvider;
      const mockChildProvider = {
        getNetwork: jest.fn().mockReturnValue({ chainId: '100' }),
      } as unknown as BrowserProvider;

      const bridgeConfig = new BridgeConfiguration({
        baseConfig: new ImmutableConfiguration({
          environment: Environment.SANDBOX,
        }),
        bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_TESTNET,
        rootProvider: mockRootProvider,
        childProvider: mockChildProvider,
      });

      expect.assertions(2);
      try {
        await validateChainConfiguration(bridgeConfig);
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.UNSUPPORTED_ERROR);
      }
    });
  });

  describe('checkReceiver', () => {
    it('Does not throw error when withdrawing ERC20 from child chain', async () => {
      const config = new BridgeConfiguration({
        baseConfig: new ImmutableConfiguration({
          environment: Environment.SANDBOX,
        }),
        bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_TESTNET,
        rootProvider: {} as BrowserProvider,
        childProvider: {} as BrowserProvider,
      });
      const tokenSent = '0x123';
      const destinationChainId = ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID;
      try {
        await checkReceiver(tokenSent, destinationChainId, '0x123', config);
      } catch (error: any) {
        throw new Error(`Should not have thrown an error, but threw ${error}`);
      }
    });

    it('Does not throw error when depositing ERC20 to child chain', async () => {
      const config = new BridgeConfiguration({
        baseConfig: new ImmutableConfiguration({
          environment: Environment.SANDBOX,
        }),
        bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_TESTNET,
        rootProvider: {} as BrowserProvider,
        childProvider: {} as BrowserProvider,
      });
      const tokenSent = '0x123';
      const destinationChainId = ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID;
      try {
        await checkReceiver(tokenSent, destinationChainId, '0x123', config);
      } catch (error: any) {
        throw new Error(`Should not have thrown an error, but threw ${error}`);
      }
    });

    it('Does not throw error when address is not a contract', async () => {
      const mockProvider = {
        getCode: jest.fn().mockReturnValue('0x'),
      } as unknown as BrowserProvider;
      const config = new BridgeConfiguration({
        baseConfig: new ImmutableConfiguration({
          environment: Environment.SANDBOX,
        }),
        bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_TESTNET,
        rootProvider: mockProvider,
        childProvider: mockProvider,
      });
      const tokenSent = childETHs.testnet;
      const destinationChainId = ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID;
      try {
        await checkReceiver(tokenSent, destinationChainId, '0x123', config);
        expect(mockProvider.getCode).toHaveBeenCalledTimes(1);
      } catch (error: any) {
        throw new Error(`Should not have thrown an error, but threw ${error}`);
      }
    });

    it(
      'Throws error when withdrawing ETH and address is a contract that does not have a receive function',
      async () => {
        const mockProvider = {
          getCode: jest.fn().mockReturnValue('0x123'),
        } as unknown as BrowserProvider;
        const mockContract = {
          estimateGas: {
            receive: jest.fn().mockRejectedValue(new Error('Function does not exist')),
          },
        } as unknown as Contract;
        jest.spyOn(ethers, 'Contract').mockReturnValue(mockContract);
        const config = new BridgeConfiguration({
          baseConfig: new ImmutableConfiguration({
            environment: Environment.SANDBOX,
          }),
          bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_TESTNET,
          rootProvider: mockProvider,
          childProvider: mockProvider,
        });
        const tokenSent = childETHs.testnet;
        const destinationChainId = ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID;
        try {
          await checkReceiver(tokenSent, destinationChainId, '0x123', config);
          expect(mockProvider.getCode).toHaveBeenCalledTimes(1);
        } catch (error: any) {
          expect(error).toBeInstanceOf(BridgeError);
        }
      },
    );

    // These involve generating bytecode that has both invalid and valid receive functions.
    it.todo('Throws error when withdrawing ETH and address is a contract that has an invalid receive function');
    it.todo('Does not throw error when withdrawing ETH and address is a contract that has a valid receive function');
  });

  describe('validateChainIds', () => {
    let bridgeConfig: BridgeConfiguration;
    beforeEach(() => {
      const voidRootProvider = new JsonRpcProvider('x');
      const voidChildProvider = new JsonRpcProvider('x');
      bridgeConfig = new BridgeConfiguration({
        baseConfig: new ImmutableConfiguration({
          environment: Environment.SANDBOX,
        }),
        bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_TESTNET,
        rootProvider: voidRootProvider,
        childProvider: voidChildProvider,
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
    it('does not throw an error when everything setup correctly', async () => {
      expect.assertions(0);
      try {
        await validateChainIds(
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
          bridgeConfig,
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.INVALID_SOURCE_CHAIN_ID);
      }
    });
    it('throws an error when the sourceChainId is not one of the ones set in the initializer', async () => {
      expect.assertions(2);
      try {
        await validateChainIds(
          '100',
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
          bridgeConfig,
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.INVALID_SOURCE_CHAIN_ID);
      }
    });
    it('throws an error when the destinationChainId is not one of the ones set in the initializer', async () => {
      expect.assertions(2);
      try {
        await validateChainIds(
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
          '100',
          bridgeConfig,
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.INVALID_DESTINATION_CHAIN_ID);
      }
    });
    it('throws an error when the sourceChainId is the same as the destinationChainId', async () => {
      expect.assertions(2);
      try {
        await validateChainIds(
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
          ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
          bridgeConfig,
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.CHAIN_IDS_MATCH);
      }
    });
  });

  describe('validateBridgeReqArgs ', () => {
    let bridgeConfig: BridgeConfiguration;

    beforeEach(() => {
      const voidRootProvider = new JsonRpcProvider('x');
      const voidChildProvider = new JsonRpcProvider('x');
      bridgeConfig = new BridgeConfiguration({
        baseConfig: new ImmutableConfiguration({
          environment: Environment.SANDBOX,
        }),
        bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_TESTNET,
        rootProvider: voidRootProvider,
        childProvider: voidChildProvider,
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
    it('does not throw an error when everything setup correctly', async () => {
      expect.assertions(0);
      try {
        await validateBridgeReqArgs(
          {
            senderAddress: '0x1234567890123456789012345678901234567890',
            recipientAddress: '0x1234567890123456789012345678901234567890',
            token: '0x1234567890123456789012345678901234567890',
            amount: parseUnits('0.01', 18),
            sourceChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
            destinationChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
            gasMultiplier: 1.1,
          },
          bridgeConfig,
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.INVALID_ADDRESS);
      }
    });
    it('throws an error when sender/recipient is not a valid address and the token is ERC20', async () => {
      expect.assertions(4);
      try {
        await validateBridgeReqArgs(
          {
            senderAddress: '0x1234567890123456789012345678901234567890',
            recipientAddress: 'invalidAddress',
            token: '0x1234567890123456789012345678901234567890',
            amount: parseUnits('0.01', 18),
            sourceChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
            destinationChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
            gasMultiplier: 1.1,
          },
          bridgeConfig,
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.INVALID_ADDRESS);
      }
      try {
        await validateBridgeReqArgs(
          {
            senderAddress: 'invalidAddress',
            recipientAddress: '0x1234567890123456789012345678901234567890',
            token: '0x1234567890123456789012345678901234567890',
            amount: parseUnits('0.01', 18),
            sourceChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
            destinationChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
            gasMultiplier: 1.1,
          },
          bridgeConfig,
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.INVALID_ADDRESS);
      }
    });
    it('throws an error when sender/recipient is not a valid address and the token is NATIVE', async () => {
      expect.assertions(4);
      try {
        await validateBridgeReqArgs(
          {
            senderAddress: '0x1234567890123456789012345678901234567890',
            recipientAddress: 'invalidAddress',
            token: NATIVE,
            amount: parseUnits('0.01', 18),
            sourceChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
            destinationChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
            gasMultiplier: 1.1,
          },
          bridgeConfig,
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.INVALID_ADDRESS);
      }
      try {
        await validateBridgeReqArgs(
          {
            senderAddress: 'invalidAddress',
            recipientAddress: '0x1234567890123456789012345678901234567890',
            token: NATIVE,
            amount: parseUnits('0.01', 18),
            sourceChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
            destinationChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
            gasMultiplier: 1.1,
          },
          bridgeConfig,
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.INVALID_ADDRESS);
      }
    });
    it('throws an error when token is not a valid address', async () => {
      expect.assertions(2);
      try {
        await validateBridgeReqArgs(
          {
            senderAddress: '0x1234567890123456789012345678901234567890',
            recipientAddress: '0x1234567890123456789012345678901234567890',
            token: 'invalidAddress',
            amount: parseUnits('0.01', 18),
            sourceChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
            destinationChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
            gasMultiplier: 1.1,
          },
          bridgeConfig,
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.INVALID_ADDRESS);
      }
    });
    it('throws an error when amount is less than or equal to 0 and token is ERC20', async () => {
      expect.assertions(2);
      try {
        await validateBridgeReqArgs(
          {
            senderAddress: '0x1234567890123456789012345678901234567890',
            recipientAddress: '0x1234567890123456789012345678901234567890',
            token: '0x1234567890123456789012345678901234567890',
            amount: BigInt(0),
            sourceChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
            destinationChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
            gasMultiplier: 1.1,
          },
          bridgeConfig,
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.INVALID_AMOUNT);
      }
    });
    it('throws an error when amount is less than or equal to 0 and token is NATIVE', async () => {
      expect.assertions(2);
      try {
        await validateBridgeReqArgs(
          {
            senderAddress: '0x1234567890123456789012345678901234567890',
            recipientAddress: '0x1234567890123456789012345678901234567890',
            token: NATIVE,
            amount: BigInt(0),
            sourceChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
            destinationChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
            gasMultiplier: 1.1,
          },
          bridgeConfig,
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.INVALID_AMOUNT);
      }
    });
  });

  describe('validateGetFee', () => {
    let bridgeConfig: BridgeConfiguration;

    beforeEach(() => {
      const voidRootProvider = new JsonRpcProvider('x');
      const voidChildProvider = new JsonRpcProvider('x');
      bridgeConfig = new BridgeConfiguration({
        baseConfig: new ImmutableConfiguration({
          environment: Environment.SANDBOX,
        }),
        bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_TESTNET,
        rootProvider: voidRootProvider,
        childProvider: voidChildProvider,
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('does not throw an error when everything setup correctly', async () => {
      validateGetFee(
        {
          action: BridgeFeeActions.DEPOSIT,
          sourceChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
          destinationChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
          gasMultiplier: 1.1,
        },
        bridgeConfig,
      );
    });

    it('throws an error when depositing and sourceChainId is not the root chainId', async () => {
      expect.assertions(2);
      try {
        validateGetFee(
          {
            action: BridgeFeeActions.DEPOSIT,
            sourceChainId: '1293123',
            destinationChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
            gasMultiplier: 1.1,
          },
          bridgeConfig,
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.INVALID_SOURCE_OR_DESTINATION_CHAIN);
      }
    });

    it('throws an error when depositing and sourceChainId is destinationChainId', async () => {
      expect.assertions(2);
      try {
        validateGetFee(
          {
            action: BridgeFeeActions.DEPOSIT,
            sourceChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
            destinationChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
            gasMultiplier: 1.1,
          },
          bridgeConfig,
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.INVALID_SOURCE_OR_DESTINATION_CHAIN);
      }
    });

    it('throws an error when withdrawing and sourceChainId is destinationChainId', async () => {
      expect.assertions(2);
      try {
        validateGetFee(
          {
            action: BridgeFeeActions.WITHDRAW,
            sourceChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
            destinationChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
            gasMultiplier: 1.1,
          },
          bridgeConfig,
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.INVALID_SOURCE_OR_DESTINATION_CHAIN);
      }
    });

    it('throws an error when finalising and sourceChainId is not rootChain', async () => {
      expect.assertions(2);
      try {
        validateGetFee(
          {
            action: BridgeFeeActions.FINALISE_WITHDRAWAL,
            sourceChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
          },
          bridgeConfig,
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.INVALID_SOURCE_CHAIN_ID);
      }
    });

    it('throws an error when depositing and sourceChainId is childChain', async () => {
      expect.assertions(2);
      try {
        validateGetFee(
          {
            action: BridgeFeeActions.DEPOSIT,
            sourceChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
            destinationChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
            gasMultiplier: 1.1,
          },
          bridgeConfig,
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.INVALID_SOURCE_OR_DESTINATION_CHAIN);
      }
    });

    it('throws an error when withdrawing and sourceChainId is rootChain', async () => {
      expect.assertions(2);
      try {
        validateGetFee(
          {
            action: BridgeFeeActions.WITHDRAW,
            sourceChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID,
            destinationChainId: ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID,
            gasMultiplier: 1.1,
          },
          bridgeConfig,
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(BridgeError);
        expect(error.type).toBe(BridgeErrorType.INVALID_SOURCE_OR_DESTINATION_CHAIN);
      }
    });
  });
});
