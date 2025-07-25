/*
 * @jest-environment jsdom
 */
import { Environment } from '@imtbl/config';
import {
  getNetworkAllowList,
  getNetworkInfo,
  switchWalletNetwork,
} from './network';
import { HttpClient } from '../api/http';
import {
  ChainId,
  WalletProviderName,
  WalletAction,
  NetworkFilterTypes,
  ChainName,
  NetworkInfo,
  WrappedBrowserProvider,
} from '../types';
import { createProvider, getUnderlyingChainId } from '../provider';
import { CheckoutError, CheckoutErrorType } from '../errors';
import { CheckoutConfiguration } from '../config';
import { RemoteConfigFetcher } from '../config/remoteConfigFetcher';
import {
  PRODUCTION_CHAIN_ID_NETWORK_MAP, SANDBOX_CHAIN_ID_NETWORK_MAP, ZKEVM_NATIVE_SANDBOX_TOKEN,
} from '../env';

let windowSpy: any;
const ethNetworkInfo = {
  name: ChainName.ETHEREUM,
  chainId: ChainId.ETHEREUM,
  nativeCurrency: {
    name: ChainName.ETHEREUM,
    symbol: 'ETH',
    decimals: 18,
  },
};
const zkevmNetworkInfo = {
  name: ChainName.IMTBL_ZKEVM_TESTNET,
  chainId: ChainId.IMTBL_ZKEVM_TESTNET,
  nativeCurrency: ZKEVM_NATIVE_SANDBOX_TOKEN,
};

const unrecognisedChainError = {
  error: {
    data: {
      originalError: {
        message: 'Provider error',
        code: 4902,
      },
    },
  },
};

const anotherUnrecognisedChainError = {
  error: {
    message: 'Provider error',
    code: 4902,
  },
};

jest.mock('../api/http', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  HttpClient: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
  })),
}));

jest.mock('../types/provider', () => ({
  ...jest.requireActual('../types/provider'),
  WrappedBrowserProvider: jest.fn(),
}));

jest.mock('../config/remoteConfigFetcher');

jest.mock('../provider/getUnderlyingProvider');

describe('network functions', () => {
  let testCheckoutConfiguration: CheckoutConfiguration;
  let mockedHttpClient: jest.Mocked<HttpClient>;

  beforeEach(() => {
    windowSpy = jest.spyOn(window, 'window', 'get');
    windowSpy.mockImplementation(() => ({
      ethereum: {
        request: jest.fn(),
      },
      dispatchEvent: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));

    mockedHttpClient = new HttpClient() as jest.Mocked<HttpClient>;
    (RemoteConfigFetcher as unknown as jest.Mock).mockReturnValue({
      getConfig: jest.fn().mockResolvedValue([
        {
          chainId: ChainId.ETHEREUM,
        },
        {
          chainId: ChainId.SEPOLIA,
        },
        {
          chainId: ChainId.IMTBL_ZKEVM_TESTNET,
        },
      ]),
    });

    testCheckoutConfiguration = new CheckoutConfiguration({
      baseConfig: { environment: Environment.SANDBOX },
    }, mockedHttpClient);
  });

  afterEach(() => {
    windowSpy.mockRestore();
    jest.clearAllMocks();
  });

  describe('switchWalletNetwork()', () => {
    it('should make request for the user to switch network', async () => {
      (WrappedBrowserProvider as unknown as jest.Mock).mockReturnValue({
        send: jest.fn(),
        getNetwork: async () => ethNetworkInfo,
        ethereumProvider: {
          isMetaMask: true,
        },
      });

      const { provider } = await createProvider(WalletProviderName.METAMASK);

      const switchNetworkResult = await switchWalletNetwork(
        new CheckoutConfiguration({
          baseConfig: { environment: Environment.PRODUCTION },
        }, mockedHttpClient),
        provider,
        ChainId.ETHEREUM,
      );

      expect(provider.send).toBeCalledWith(WalletAction.SWITCH_NETWORK, [
        {
          chainId: PRODUCTION_CHAIN_ID_NETWORK_MAP.get(ChainId.ETHEREUM)!.chainIdHex,
        },
      ]);
      expect(switchNetworkResult.network).toEqual({
        name: ChainName.ETHEREUM,
        chainId: ChainId.ETHEREUM,
        isSupported: true,
        nativeCurrency: {
          name: ChainName.ETHEREUM,
          symbol: 'ETH',
          decimals: 18,
        },
      });
    });

    it('should make request for the user to switch network zkevm', async () => {
      (WrappedBrowserProvider as unknown as jest.Mock)
        .mockReturnValueOnce({
          send: jest.fn(),
          getNetwork: jest.fn().mockResolvedValue(ethNetworkInfo),
          ethereumProvider: {
            isMetaMask: true,
          },
        })
        .mockReturnValueOnce({
          send: jest.fn(),
          getNetwork: jest.fn().mockResolvedValue(zkevmNetworkInfo),
          ethereumProvider: {
            isMetaMask: true,
          },
        });

      const { provider } = await createProvider(WalletProviderName.METAMASK);

      const switchNetworkResult = await switchWalletNetwork(
        testCheckoutConfiguration,
        provider,
        ChainId.IMTBL_ZKEVM_TESTNET,
      );

      expect(provider.send).toBeCalledWith(WalletAction.SWITCH_NETWORK, [
        {
          chainId: testCheckoutConfiguration.networkMap.get(
            ChainId.IMTBL_ZKEVM_TESTNET,
          )?.chainIdHex,
        },
      ]);
      const copyZkevmNetworkInfo = zkevmNetworkInfo as unknown as NetworkInfo;
      copyZkevmNetworkInfo.isSupported = true;
      copyZkevmNetworkInfo.chainId = zkevmNetworkInfo.chainId;
      expect(switchNetworkResult.network).toEqual(copyZkevmNetworkInfo);
    });

    it('should throw an error if the network is not in our whitelist', async () => {
      (WrappedBrowserProvider as unknown as jest.Mock).mockReturnValueOnce({
        send: jest.fn(),
        getNetwork: jest.fn().mockResolvedValue(ethNetworkInfo),
        ethereumProvider: {
          isMetaMask: true,
        },
      });

      const { provider } = await createProvider(WalletProviderName.METAMASK);

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
      (WrappedBrowserProvider as unknown as jest.Mock).mockReturnValue({
        send: jest.fn(),
        getNetwork: jest.fn().mockResolvedValue(ethNetworkInfo),
        ethereumProvider: {
          isMetaMask: true,
        },
      });

      windowSpy.mockImplementation(() => ({
        ethereum: {
          request: jest
            .fn()
            .mockResolvedValueOnce({})
            .mockRejectedValue({
              message: 'Provider error',
            }),
        },
        addEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
        removeEventListener: () => {},
      }));

      const { provider } = await createProvider(WalletProviderName.METAMASK);

      try {
        await switchWalletNetwork(
          testCheckoutConfiguration,
          provider,
          ChainId.IMTBL_ZKEVM_TESTNET,
        );
      } catch (err: any) {
        expect(err.message).toEqual('User cancelled switch network request');
        expect(err.type).toEqual(CheckoutErrorType.USER_REJECTED_REQUEST_ERROR);
      }
    });

    it('should throw an error if the user rejects the add network request', async () => {
      (WrappedBrowserProvider as unknown as jest.Mock).mockReturnValue({
        send: jest
          .fn()
          .mockRejectedValue(unrecognisedChainError),
        ethereumProvider: {
          isMetaMask: true,
        },
        getNetwork: jest.fn().mockResolvedValue(ethNetworkInfo),
      });

      const { provider } = await createProvider(WalletProviderName.METAMASK);

      try {
        await switchWalletNetwork(
          testCheckoutConfiguration,
          provider,
          ChainId.IMTBL_ZKEVM_TESTNET,
        );
      } catch (err: any) {
        expect(err.message).toEqual('User cancelled add network request');
        expect(err.type).toEqual(CheckoutErrorType.USER_REJECTED_REQUEST_ERROR);
      }
    });

    it('should throw an error if user rejects request and non-4902 code', async () => {
      (WrappedBrowserProvider as unknown as jest.Mock).mockReturnValue({
        send: jest
          .fn()
          .mockRejectedValue({
            message: 'Provider error',
            code: 4000,
          }),
        ethereumProvider: {
          isMetaMask: true,
        },
        getNetwork: jest.fn().mockResolvedValue(ethNetworkInfo),
      });

      const { provider } = await createProvider(WalletProviderName.METAMASK);

      try {
        await switchWalletNetwork(
          testCheckoutConfiguration,
          provider,
          ChainId.IMTBL_ZKEVM_TESTNET,
        );
      } catch (err: any) {
        expect(err.message).toEqual('User cancelled switch network request');
        expect(err.type).toEqual(CheckoutErrorType.USER_REJECTED_REQUEST_ERROR);
      }
    });

    it('should request the user to add a new network if their wallet does not already have it', async () => {
      (WrappedBrowserProvider as unknown as jest.Mock)
        .mockReturnValueOnce({
          send: jest
            .fn()
            .mockRejectedValueOnce(unrecognisedChainError)
            .mockResolvedValueOnce({}),
          ethereumProvider: {
            isMetaMask: true,
          },
          getNetwork: jest.fn().mockResolvedValue(zkevmNetworkInfo),
        })
        .mockReturnValueOnce({
          send: jest.fn().mockResolvedValueOnce({}),
          ethereumProvider: {
            isMetaMask: true,
          },
          getNetwork: jest.fn().mockResolvedValue(zkevmNetworkInfo),
        });
      const { provider } = await createProvider(WalletProviderName.METAMASK);

      await switchWalletNetwork(
        testCheckoutConfiguration,
        provider,
        ChainId.IMTBL_ZKEVM_TESTNET,
      );

      expect(provider.send).toHaveBeenCalledWith(WalletAction.ADD_NETWORK, [
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
      ]);
    });

    it('should request the user to add a new network when anotherUnrecognisedChainError is received', async () => {
      (WrappedBrowserProvider as unknown as jest.Mock)
        .mockReturnValueOnce({
          send: jest
            .fn()
            .mockRejectedValueOnce(anotherUnrecognisedChainError)
            .mockResolvedValueOnce({}),
          ethereumProvider: {
            isMetaMask: true,
          },
          getNetwork: jest.fn().mockResolvedValue(zkevmNetworkInfo),
        })
        .mockReturnValueOnce({
          send: jest.fn().mockResolvedValueOnce({}),
          ethereumProvider: {
            isMetaMask: true,
          },
          getNetwork: jest.fn().mockResolvedValue(zkevmNetworkInfo),
        });
      const { provider } = await createProvider(WalletProviderName.METAMASK);

      await switchWalletNetwork(
        testCheckoutConfiguration,
        provider,
        ChainId.IMTBL_ZKEVM_TESTNET,
      );

      expect(provider.send).toHaveBeenCalledWith(WalletAction.ADD_NETWORK, [
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
      ]);
    });

    it('should throw an error when switch network is called with a passport provider', async () => {
      try {
        await switchWalletNetwork(
          testCheckoutConfiguration,
          { ethereumProvider: { isPassport: true } } as unknown as WrappedBrowserProvider,
          ChainId.SEPOLIA,
        );
      } catch (err: any) {
        expect(err.message).toBe('Switching networks with Passport provider is not supported');
        expect(err.type).toBe(CheckoutErrorType.SWITCH_NETWORK_UNSUPPORTED);
      }
    });
  });

  describe('getNetworkInfo', () => {
    const getNetworkTestCases = [
      {
        chainId: ChainId.SEPOLIA,
        chainName: ChainName.SEPOLIA,
      },
      {
        chainId: ChainId.IMTBL_ZKEVM_TESTNET,
        chainName: ChainName.IMTBL_ZKEVM_TESTNET,
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
          mockProvider as unknown as WrappedBrowserProvider,
        );
        expect(result.name).toBe(
          SANDBOX_CHAIN_ID_NETWORK_MAP.get(testCase.chainId)?.chainName,
        );
        expect(result.chainId).toBe(
          parseInt(
            SANDBOX_CHAIN_ID_NETWORK_MAP.get(testCase.chainId)?.chainIdHex
              ?? '',
            16,
          ),
        );
        expect(result.nativeCurrency).toEqual(
          SANDBOX_CHAIN_ID_NETWORK_MAP.get(testCase.chainId)?.nativeCurrency,
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
        mockProvider as unknown as WrappedBrowserProvider,
      );
      expect(result).toEqual({
        chainId: 3,
        name: 'ropsten',
        isSupported: false,
      });
    });

    it('should get underlying chain id if get network errors', async () => {
      const getNetworkMock = jest.fn().mockRejectedValue({});
      const mockProvider = {
        getNetwork: getNetworkMock,
      };

      (getUnderlyingChainId as jest.Mock).mockReturnValue(ChainId.SEPOLIA);

      const result = await getNetworkInfo(
        testCheckoutConfiguration,
        mockProvider as unknown as WrappedBrowserProvider,
      );

      expect(result).toEqual({
        chainId: ChainId.SEPOLIA,
        isSupported: true,
      });
    });
  });

  describe('getNetworkAllowList()', () => {
    it('should return an empty list if no configuration is provided', async () => {
      (RemoteConfigFetcher as unknown as jest.Mock).mockReturnValue({
        getConfig: jest.fn().mockResolvedValue(undefined),
      });

      const emptyCheckoutConfiguration = new CheckoutConfiguration({
        baseConfig: { environment: Environment.SANDBOX },
      }, mockedHttpClient);
      const allowListResult = await getNetworkAllowList(emptyCheckoutConfiguration, {
        type: NetworkFilterTypes.ALL,
      });
      expect(allowListResult).toEqual({
        networks: [],
      });
    });

    it('should return all the networks if no exclude filter is provided', async () => {
      const allowListResult = await getNetworkAllowList(testCheckoutConfiguration, {
        type: NetworkFilterTypes.ALL,
      });
      expect(allowListResult).toEqual({
        networks: [
          {
            name: ChainName.SEPOLIA,
            chainId: ChainId.SEPOLIA,
            isSupported: true,
            nativeCurrency: {
              name: 'Sep Eth',
              symbol: 'ETH',
              decimals: 18,
            },
          },
          {
            name: ChainName.IMTBL_ZKEVM_TESTNET,
            chainId: ChainId.IMTBL_ZKEVM_TESTNET,
            isSupported: true,
            nativeCurrency: ZKEVM_NATIVE_SANDBOX_TOKEN,
          },
        ],
      });
    });

    it('should exclude the right networks if an exclude filter is provided', async () => {
      const allowListResult = await getNetworkAllowList(testCheckoutConfiguration, {
        type: NetworkFilterTypes.ALL,
        exclude: [{ chainId: ChainId.IMTBL_ZKEVM_TESTNET }],
      });
      expect(allowListResult).toEqual({
        networks: [
          {
            name: ChainName.SEPOLIA,
            chainId: ChainId.SEPOLIA,
            isSupported: true,
            nativeCurrency: {
              name: 'Sep Eth',
              symbol: 'ETH',
              decimals: 18,
            },
          },
        ],
      });
    });
  });
});
