/*
 * @jest-environment jsdom
 */
import { Web3Provider } from '@ethersproject/providers';
import { Environment } from '@imtbl/config';
import {
  getNetworkAllowList,
  getNetworkInfo,
  switchWalletNetwork,
} from './network';
import {
  ChainId,
  PRODUCTION_CHAIN_ID_NETWORK_MAP,
  WalletProviderName,
  WalletAction,
  NetworkFilterTypes,
} from '../types';
import { createProvider } from '../provider';
import { CheckoutError, CheckoutErrorType } from '../errors';
import { CheckoutConfiguration } from '../config';
import { RemoteConfigFetcher } from '../config/remoteConfigFetcher';

let windowSpy: any;
const providerMock = {
  request: jest.fn(),
};
const ethNetworkInfo = {
  name: 'Ethereum',
  chainId: ChainId.ETHEREUM,
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
};
const zkevmNetworkInfo = {
  name: 'IMTBL_ZKEVM_TESTNET',
  chainId: ChainId.IMTBL_ZKEVM_TESTNET,
  nativeCurrency: {
    name: 'IMX',
    symbol: 'IMX',
    decimals: 18,
  },
};

jest.mock('@ethersproject/providers', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Web3Provider: jest.fn(),
}));

jest.mock('../config/remoteConfigFetcher');

describe('network functions', () => {
  let testCheckoutConfiguration: CheckoutConfiguration;

  beforeEach(() => {
    jest.clearAllMocks();

    (RemoteConfigFetcher as jest.Mock).mockReturnValue({
      get: jest.fn().mockResolvedValue([
        {
          chainId: 1,
        },
        {
          chainId: 11155111,
        },
        {
          chainId: 13372,
        },
        {
          chainId: 13373,
        },
      ]),
    });

    testCheckoutConfiguration = new CheckoutConfiguration({
      baseConfig: { environment: Environment.PRODUCTION },
    });
  });

  describe('switchWalletNetwork()', () => {
    beforeEach(() => {
      windowSpy = jest.spyOn(window, 'window', 'get');

      windowSpy.mockImplementation(() => ({
        ethereum: {
          request: jest.fn(),
        },
        removeEventListener: () => {},
      }));
    });

    afterEach(() => {
      windowSpy.mockRestore();
    });

    it('should make request for the user to switch network', async () => {
      (Web3Provider as unknown as jest.Mock).mockReturnValue({
        provider: providerMock,
        getNetwork: async () => ethNetworkInfo,
        network: {
          chainId: ethNetworkInfo.chainId,
        },
      });

      const provider = await createProvider(WalletProviderName.METAMASK);

      const switchNetworkResult = await switchWalletNetwork(
        testCheckoutConfiguration,
        provider,
        ChainId.ETHEREUM,
      );

      expect(provider.provider.request).toBeCalledWith({
        method: WalletAction.SWITCH_NETWORK,
        params: [
          {
            chainId: PRODUCTION_CHAIN_ID_NETWORK_MAP.get(ChainId.ETHEREUM)
              ?.chainIdHex,
          },
        ],
      });
      expect(switchNetworkResult.network).toEqual({
        name: 'Ethereum',
        chainId: 1,
        isSupported: true,
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
      });
    });

    it('should make request for the user to switch network zkevm', async () => {
      (Web3Provider as unknown as jest.Mock)
        .mockReturnValueOnce({
          provider: providerMock,
          getNetwork: async () => ethNetworkInfo,
          network: {
            chainId: ethNetworkInfo.chainId,
          },
        })
        .mockReturnValueOnce({
          provider: {
            request: jest.fn(),
          },
          getNetwork: async () => zkevmNetworkInfo,
          network: {
            chainId: zkevmNetworkInfo.chainId,
          },
        });

      const provider = await createProvider(WalletProviderName.METAMASK);

      const switchNetworkResult = await switchWalletNetwork(
        testCheckoutConfiguration,
        provider,
        ChainId.IMTBL_ZKEVM_TESTNET,
      );

      expect(provider.provider.request).toBeCalledWith({
        method: WalletAction.SWITCH_NETWORK,
        params: [
          {
            chainId: testCheckoutConfiguration.networkMap.get(
              ChainId.IMTBL_ZKEVM_TESTNET,
            )?.chainIdHex,
          },
        ],
      });
      expect(switchNetworkResult.network).toEqual({
        name: 'Immutable zkEVM Testnet',
        chainId: 13372,
        isSupported: true,
        nativeCurrency: {
          name: 'IMX',
          symbol: 'IMX',
          decimals: 18,
        },
      });
    });

    it('should throw an error if the network is not in our whitelist', async () => {
      (Web3Provider as unknown as jest.Mock).mockReturnValueOnce({
        provider: providerMock,
        getNetwork: async () => ethNetworkInfo,
        network: {
          chainId: ethNetworkInfo.chainId,
        },
      });

      const provider = await createProvider(WalletProviderName.METAMASK);

      await expect(
        switchWalletNetwork(testCheckoutConfiguration, provider, 56 as ChainId),
      ).rejects.toThrow(
        new CheckoutError(
          'Chain:56 is not a supported chain',
          CheckoutErrorType.CHAIN_NOT_SUPPORTED_ERROR,
        ),
      );
    });

    it('should throw an error if the user rejects the switch network request', async () => {
      (Web3Provider as unknown as jest.Mock).mockReturnValue({
        provider: providerMock,
        getNetwork: async () => ethNetworkInfo,
        network: {
          chainId: ethNetworkInfo.chainId,
        },
      });

      windowSpy.mockImplementation(() => ({
        ethereum: {
          request: jest
            .fn()
            .mockResolvedValueOnce({})
            .mockRejectedValue(new Error()),
        },
        removeEventListener: () => {},
      }));

      const provider = await createProvider(WalletProviderName.METAMASK);

      await expect(
        switchWalletNetwork(
          testCheckoutConfiguration,
          provider,
          ChainId.IMTBL_ZKEVM_TESTNET,
        ),
      ).rejects.toThrow(
        new CheckoutError(
          'User cancelled switch network request',
          CheckoutErrorType.USER_REJECTED_REQUEST_ERROR,
        ),
      );
    });

    it('should throw an error if the provider does not have a request function', async () => {
      windowSpy.mockImplementation(() => ({
        ethereum: {
          request: jest.fn().mockResolvedValueOnce({}),
        },
        removeEventListener: () => {},
      }));

      const provider = await createProvider(WalletProviderName.METAMASK);

      // remove request function from provider
      delete provider.provider.request;

      await expect(
        switchWalletNetwork(
          testCheckoutConfiguration,
          provider,
          ChainId.IMTBL_ZKEVM_TESTNET,
        ),
      ).rejects.toThrow(
        new CheckoutError(
          'User cancelled switch network request',
          CheckoutErrorType.PROVIDER_REQUEST_MISSING_ERROR,
        ),
      );
    });

    it('should request the user to add a new network if their wallet does not already have it', async () => {
      (Web3Provider as unknown as jest.Mock)
        .mockReturnValueOnce({
          provider: {
            request: jest
              .fn()
              .mockRejectedValueOnce({ code: 4902 })
              .mockResolvedValueOnce({}),
          },
          getNetwork: async () => zkevmNetworkInfo,
          network: {
            chainId: zkevmNetworkInfo.chainId,
          },
        })
        .mockReturnValueOnce({
          provider: {
            request: jest.fn().mockResolvedValueOnce({}),
          },
          getNetwork: async () => zkevmNetworkInfo,
          network: {
            chainId: zkevmNetworkInfo.chainId,
          },
        });
      const provider = await createProvider(WalletProviderName.METAMASK);

      await switchWalletNetwork(
        testCheckoutConfiguration,
        provider,
        ChainId.IMTBL_ZKEVM_TESTNET,
      );

      expect(provider.provider.request).toHaveBeenCalledWith({
        method: WalletAction.ADD_NETWORK,
        params: [
          {
            chainId: testCheckoutConfiguration.networkMap.get(
              ChainId.IMTBL_ZKEVM_TESTNET,
            )?.chainIdHex,
            chainName: testCheckoutConfiguration.networkMap.get(
              ChainId.IMTBL_ZKEVM_TESTNET,
            )?.chainName,
            rpcUrls: testCheckoutConfiguration.networkMap.get(
              ChainId.IMTBL_ZKEVM_TESTNET,
            )?.rpcUrls,
            nativeCurrency: testCheckoutConfiguration.networkMap.get(
              ChainId.IMTBL_ZKEVM_TESTNET,
            )?.nativeCurrency,
            blockExplorerUrls: testCheckoutConfiguration.networkMap.get(
              ChainId.IMTBL_ZKEVM_TESTNET,
            )?.blockExplorerUrls,
          },
        ],
      });
    });
  });

  describe('getNetworkInfo', () => {
    const getNetworkTestCases = [
      {
        chainId: 1 as ChainId,
        chainName: 'homestead',
      },
      {
        chainId: 13372 as ChainId,
        chainName: 'IMX',
      },
    ];

    getNetworkTestCases.forEach((testCase) => {
      it(`should return the network info for the ${testCase.chainName} network`, async () => {
        const getNetworkMock = jest.fn().mockResolvedValue({
          chainId: testCase.chainId,
          name: testCase.chainName,
        });
        const mockProvider = {
          getNetwork: getNetworkMock,
        };
        const result = await getNetworkInfo(
          testCheckoutConfiguration,
          mockProvider as unknown as Web3Provider,
        );
        expect(result.name).toBe(
          PRODUCTION_CHAIN_ID_NETWORK_MAP.get(testCase.chainId)?.chainName,
        );
        expect(result.chainId).toBe(
          parseInt(
            PRODUCTION_CHAIN_ID_NETWORK_MAP.get(testCase.chainId)?.chainIdHex
              ?? '',
            16,
          ),
        );
        expect(result.nativeCurrency).toEqual(
          PRODUCTION_CHAIN_ID_NETWORK_MAP.get(testCase.chainId)?.nativeCurrency,
        );
      });
    });

    it('should return basic details for an unsupported network', async () => {
      const getNetworkMock = jest.fn().mockResolvedValue({
        chainId: 3,
        name: 'ropsten',
      });
      const mockProvider = {
        getNetwork: getNetworkMock,
      };
      const result = await getNetworkInfo(
        testCheckoutConfiguration,
        mockProvider as unknown as Web3Provider,
      );
      expect(result).toEqual({
        chainId: 3,
        name: 'ropsten',
        isSupported: false,
      });
    });
  });

  describe('getNetworkAllowList()', () => {
    it('should return all the networks if no exclude filter is provided', async () => {
      await expect(
        await getNetworkAllowList(testCheckoutConfiguration, {
          type: NetworkFilterTypes.ALL,
        }),
      ).toEqual({
        networks: [
          {
            name: 'Ethereum',
            chainId: 1,
            isSupported: true,
            nativeCurrency: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18,
            },
          },
          {
            name: 'Immutable zkEVM Testnet',
            chainId: 13372,
            isSupported: true,
            nativeCurrency: {
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
            },
          },
        ],
      });
    });

    it('should exclude the right networks if an exclude filter is provided', async () => {
      await expect(
        await getNetworkAllowList(testCheckoutConfiguration, {
          type: NetworkFilterTypes.ALL,
          exclude: [{ chainId: 13372 }],
        }),
      ).toEqual({
        networks: [
          {
            name: 'Ethereum',
            chainId: 1,
            isSupported: true,
            nativeCurrency: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18,
            },
          },
        ],
      });
    });
  });
});
