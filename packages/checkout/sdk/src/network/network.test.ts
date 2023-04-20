/*
 * @jest-environment jsdom
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import { switchWalletNetwork, getNetworkAllowList } from './network';
import { ChainId, WALLET_ACTION } from '../types';
import { connectWalletProvider } from '../connect';
import { ChainIdNetworkMap, ConnectionProviders } from '../types';
import { CheckoutError, CheckoutErrorType } from '../errors';

let windowSpy: any;

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
      const provider = await connectWalletProvider({
        providerPreference: ConnectionProviders.METAMASK,
      });

      const switchNetworkResult = await switchWalletNetwork(
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
      expect(switchNetworkResult).toEqual({
        network: {
          name: 'Ethereum',
          chainId: 1,
          nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
          },
        },
      });
    });

    it('should make request for the user to switch network', async () => {
      const provider = await connectWalletProvider({
        providerPreference: ConnectionProviders.METAMASK,
      });

      const switchNetworkResult = await switchWalletNetwork(
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
      expect(switchNetworkResult).toEqual({
        network: {
          name: 'Polygon',
          chainId: 137,
          nativeCurrency: {
            name: 'MATIC',
            symbol: 'MATIC',
            decimals: 18,
          },
        },
      });
    });

    it('should throw an error if the network is not in our whitelist', async () => {
      const provider = await connectWalletProvider({
        providerPreference: ConnectionProviders.METAMASK,
      });

      await expect(
        switchWalletNetwork(provider, 56 as ChainId)
      ).rejects.toThrow(
        new CheckoutError(
          '56 is not a supported chain',
          CheckoutErrorType.CHAIN_NOT_SUPPORTED_ERROR
        )
      );
    });

    it('should throw an error if the user rejects the switch network request', async () => {
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
        switchWalletNetwork(provider, ChainId.POLYGON)
      ).rejects.toThrow(
        new CheckoutError(
          'user cancelled the switch network request',
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
        switchWalletNetwork(provider, ChainId.POLYGON)
      ).rejects.toThrow(
        new CheckoutError(
          'provider object is missing request function',
          CheckoutErrorType.PROVIDER_REQUEST_MISSING_ERROR
        )
      );
    });

    it('should request the user to add a new network if their wallet does not already have it', async () => {
      windowSpy.mockImplementation(() => ({
        ethereum: {
          request: jest
            .fn()
            .mockResolvedValueOnce({})
            .mockRejectedValueOnce(new Error('Unrecognized chain ID')),
        },
        removeEventListener: () => {},
      }));

      const provider = await connectWalletProvider({
        providerPreference: ConnectionProviders.METAMASK,
      });

      await switchWalletNetwork(provider, ChainId.POLYGON);
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

    it('should throw an error when the user cancels an add network request', async () => {
      const requestMock = jest
        .fn()
        .mockResolvedValueOnce({}) // resolve for the connection request
        .mockRejectedValueOnce(new Error('Unrecognized chain ID')) // reject for the switch network request as chain is not addded yet
        .mockRejectedValueOnce(new Error()); // reject for the add network request - user cancels

      windowSpy.mockImplementation(() => ({
        ethereum: {
          request: requestMock,
        },
        removeEventListener: () => {},
      }));

      const provider = await connectWalletProvider({
        providerPreference: ConnectionProviders.METAMASK,
      });

      await expect(
        switchWalletNetwork(provider, ChainId.POLYGON)
      ).rejects.toThrow(
        new CheckoutError(
          'user cancelled the add network request',
          CheckoutErrorType.USER_REJECTED_REQUEST_ERROR
        )
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

  describe('getNetworkAllowList()', () => {
    it('should return all the networks if no exclude filter is provided', async () => {
      await expect(await getNetworkAllowList({})).toEqual({
        networks: [
          {
            name: 'Ethereum',
            chainId: 1,
            nativeCurrency: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18,
              icon: '',
            },
          },
          {
            name: 'Goerli',
            chainId: 5,
            nativeCurrency: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18,
              icon: '',
            },
          },
        ],
      });
    });

    it('should exclude the right networks if an exclude filter is provided', async () => {
      await expect(
        await getNetworkAllowList({ exclude: [{ chainId: 5 }] })
      ).toEqual({
        networks: [
          {
            name: 'Ethereum',
            chainId: 1,
            nativeCurrency: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18,
              icon: '',
            },
          },
        ],
      });
    });
  });
});
