/*
 * @jest-environment jsdom
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import {
  getNetworkAllowList,
  getNetworkInfo,
  switchWalletNetwork,
} from './network';
import {
  ChainId,
  ChainIdNetworkMap,
  ConnectionProviders,
  NetworkFilterTypes,
  WALLET_ACTION,
} from '../types';
import { connectWalletProvider } from '../connect';
import { CheckoutError, CheckoutErrorType } from '../errors';
import { Web3Provider } from '@ethersproject/providers';

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
const polygonNetworkInfo = {
  name: 'Polygon',
  chainId: ChainId.POLYGON,
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
};

jest.mock('@ethersproject/providers', () => ({
  Web3Provider: jest.fn(),
}));

describe('network functions', () => {
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
      });

      const provider = await connectWalletProvider({
        providerPreference: ConnectionProviders.METAMASK,
      });

      const switchNetworkResult = await switchWalletNetwork(
        ConnectionProviders.METAMASK,
        provider,
        ChainId.ETHEREUM
      );

      expect(provider.provider.request).toBeCalledWith({
        method: WALLET_ACTION.SWITCH_NETWORK,
        params: [
          {
            chainId: ChainIdNetworkMap[ChainId.ETHEREUM].chainIdHex,
          },
        ],
      });
      expect(switchNetworkResult.network).toEqual({
        name: 'Ethereum',
        chainId: 1,
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
      });
    });

    it('should make request for the user to switch network Polygon', async () => {
      (Web3Provider as unknown as jest.Mock)
        .mockReturnValueOnce({
          provider: providerMock,
          getNetwork: async () => ethNetworkInfo,
        })
        .mockReturnValueOnce({
          provider: {
            request: jest.fn(),
          },
          getNetwork: async () => polygonNetworkInfo,
        });

      const provider = await connectWalletProvider({
        providerPreference: ConnectionProviders.METAMASK,
      });

      const switchNetworkResult = await switchWalletNetwork(
        ConnectionProviders.METAMASK,
        provider,
        ChainId.POLYGON
      );

      expect(provider.provider.request).toBeCalledWith({
        method: WALLET_ACTION.SWITCH_NETWORK,
        params: [
          {
            chainId: ChainIdNetworkMap[ChainId.POLYGON].chainIdHex,
          },
        ],
      });
      expect(switchNetworkResult.network).toEqual({
        name: 'Polygon',
        chainId: 137,
        nativeCurrency: {
          name: 'MATIC',
          symbol: 'MATIC',
          decimals: 18,
        },
      });
    });

    it('should throw an error if the network is not in our whitelist', async () => {
      (Web3Provider as unknown as jest.Mock).mockReturnValueOnce({
        provider: providerMock,
        getNetwork: async () => ethNetworkInfo,
      });

      const provider = await connectWalletProvider({
        providerPreference: ConnectionProviders.METAMASK,
      });

      await expect(
        switchWalletNetwork(
          ConnectionProviders.METAMASK,
          provider,
          56 as ChainId
        )
      ).rejects.toThrow(
        new CheckoutError(
          'Chain:56 is not a supported chain',
          CheckoutErrorType.CHAIN_NOT_SUPPORTED_ERROR
        )
      );
    });

    it('should throw an error if the user rejects the switch network request', async () => {
      (Web3Provider as unknown as jest.Mock).mockReturnValue({
        provider: providerMock,
        getNetwork: async () => ethNetworkInfo,
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

      const provider = await connectWalletProvider({
        providerPreference: ConnectionProviders.METAMASK,
      });

      await expect(
        switchWalletNetwork(
          ConnectionProviders.METAMASK,
          provider,
          ChainId.POLYGON
        )
      ).rejects.toThrow(
        new CheckoutError(
          'User cancelled switch network request',
          CheckoutErrorType.USER_REJECTED_REQUEST_ERROR
        )
      );
    });

    it('should throw an error if the provider does not have a request function', async () => {
      windowSpy.mockImplementation(() => ({
        ethereum: {
          request: jest.fn().mockResolvedValueOnce({}),
        },
        removeEventListener: () => {},
      }));

      const provider = await connectWalletProvider({
        providerPreference: ConnectionProviders.METAMASK,
      });

      // remove request function from provider
      delete provider.provider.request;

      await expect(
        switchWalletNetwork(
          ConnectionProviders.METAMASK,
          provider,
          ChainId.POLYGON
        )
      ).rejects.toThrow(
        new CheckoutError(
          'Incompatible provider',
          CheckoutErrorType.PROVIDER_REQUEST_MISSING_ERROR
        )
      );
    });

    it('should request the user to add a new network if their wallet does not already have it', async () => {
      (Web3Provider as unknown as jest.Mock)
        .mockReturnValueOnce({
          provider: {
            request: jest
              .fn()
              .mockResolvedValueOnce({})
              .mockRejectedValueOnce({ code: 4902 })
              .mockResolvedValueOnce({}),
          },
          getNetwork: async () => polygonNetworkInfo,
        })
        .mockReturnValueOnce({
          provider: {
            request: jest.fn().mockResolvedValueOnce({}),
          },
          getNetwork: async () => polygonNetworkInfo,
        });
      const provider = await connectWalletProvider({
        providerPreference: ConnectionProviders.METAMASK,
      });

      await switchWalletNetwork(
        ConnectionProviders.METAMASK,
        provider,
        ChainId.POLYGON
      );

      expect(provider.provider.request).toHaveBeenCalledWith({
        method: WALLET_ACTION.ADD_NETWORK,
        params: [
          {
            chainId: ChainIdNetworkMap[ChainId.POLYGON].chainIdHex,
            chainName: ChainIdNetworkMap[ChainId.POLYGON].chainName,
            rpcUrls: ChainIdNetworkMap[ChainId.POLYGON].rpcUrls,
            nativeCurrency: ChainIdNetworkMap[ChainId.POLYGON].nativeCurrency,
            blockExplorerUrls:
              ChainIdNetworkMap[ChainId.POLYGON].blockExplorerUrls,
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
        chainId: 5 as ChainId,
        chainName: 'goerli',
      },
      {
        chainId: 137 as ChainId,
        chainName: 'matic',
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
          mockProvider as unknown as Web3Provider
        );
        expect(result.name).toBe(ChainIdNetworkMap[testCase.chainId].chainName);
        expect(result.chainId).toBe(
          parseInt(ChainIdNetworkMap[testCase.chainId].chainIdHex, 16)
        );
        expect(result.nativeCurrency).toEqual(
          ChainIdNetworkMap[testCase.chainId].nativeCurrency
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
        mockProvider as unknown as Web3Provider
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
        await getNetworkAllowList({ type: NetworkFilterTypes.ALL })
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
            name: 'Polygon',
            chainId: 137,
            isSupported: true,
            nativeCurrency: {
              name: 'MATIC',
              symbol: 'MATIC',
              decimals: 18,
            },
          },
        ],
      });
    });

    it('should exclude the right networks if an exclude filter is provided', async () => {
      await expect(
        await getNetworkAllowList({
          type: NetworkFilterTypes.ALL,
          exclude: [{ chainId: 5 }, { chainId: 137 }],
        })
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
