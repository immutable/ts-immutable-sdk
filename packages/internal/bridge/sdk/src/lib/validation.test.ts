import { ImmutableConfiguration, Environment } from '@imtbl/config';
import { BridgeConfiguration } from 'config';
import { ETH_SEPOLIA_TO_ZKEVM_TESTNET } from 'constants/bridges';
import { BridgeError, BridgeErrorType } from 'errors';
import { ethers } from 'ethers';
import { validateChainConfiguration } from './validation';

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
      expect.assertions(0);
      try {
        await validateChainConfiguration(bridgeConfig);
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
});
