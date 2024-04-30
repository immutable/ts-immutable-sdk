import { ImmutableConfiguration, Environment } from '@imtbl/config';
import { BridgeConfiguration } from 'config';
import { ETH_SEPOLIA_TO_ZKEVM_TESTNET, childETHs } from 'constants/bridges';
import { BridgeError, BridgeErrorType } from 'errors';
import { ethers } from 'ethers';
import { checkReceiver, validateChainConfiguration } from './validation';

describe('Validation', () => {
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
      try {
        await validateChainConfiguration(bridgeConfig);
      } catch (error: any) {
        throw new Error(`Should not have thrown an error, but threw ${error}`);
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
        rootProvider: {} as ethers.providers.Web3Provider,
        childProvider: {} as ethers.providers.Web3Provider,
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
        rootProvider: {} as ethers.providers.Web3Provider,
        childProvider: {} as ethers.providers.Web3Provider,
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
      } as unknown as ethers.providers.Web3Provider;
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
        } as unknown as ethers.providers.Web3Provider;
        const mockContract = {
          estimateGas: {
            receive: jest.fn().mockRejectedValue(new Error('Function does not exist')),
          },
        } as unknown as ethers.Contract;
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
});
