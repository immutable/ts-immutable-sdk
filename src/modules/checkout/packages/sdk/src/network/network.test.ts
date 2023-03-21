/*
 * @jest-environment jsdom
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import { switchWalletNetwork } from './network'
import { WALLET_ACTION } from '../types'
import { ConnectionProviders, connectWalletProvider } from '../connect';
import { Network, NetworkMap } from './types';
import { CheckoutError, CheckoutErrorType } from '../errors';

let windowSpy: any;

describe("network functions", () => {

  beforeEach(() => {
    windowSpy = jest.spyOn(window, "window", "get");

    windowSpy.mockImplementation(() => ({
      ethereum: {
        request: jest.fn(),
      },
      removeEventListener: () => {}
    }));
  });

  afterEach(() => {
    windowSpy.mockRestore();
  });

  it('should make request for the user to switch network', async () => {
    const provider = await connectWalletProvider({
      providerPreference: ConnectionProviders.METAMASK
    });

    await switchWalletNetwork(provider, Network.ETHEREUM);

    expect(provider.provider.request).toBeCalledWith(
      {
        method: WALLET_ACTION.SWITCH_NETWORK, 
        params: [
          {
            chainId: NetworkMap[Network.ETHEREUM].chainId
          }
        ]
      }
    );
  });

  it('should throw an error if the network is not in our whitelist', async () => {
    const provider = await connectWalletProvider({
      providerPreference: ConnectionProviders.METAMASK
    });

    await expect(switchWalletNetwork(provider, 'Fantom' as Network)).rejects.toThrow(new CheckoutError('Fantom is not a supported network', CheckoutErrorType.NETWORK_NOT_SUPPORTED_ERROR));
  })

  it('should throw an error if the user rejects the switch network request', async () => {
    windowSpy.mockImplementation(() => ({
      ethereum: {
        request: jest.fn()
        .mockResolvedValueOnce({})
        .mockRejectedValue(new Error())
      },
      removeEventListener: () => {}
    }));

    const provider = await connectWalletProvider({
      providerPreference: ConnectionProviders.METAMASK
    });

    await expect(switchWalletNetwork(provider, Network.POLYGON)).rejects.toThrow(new CheckoutError('user cancelled the switch network request', CheckoutErrorType.USER_REJECTED_REQUEST_ERROR));
  })

  it('should throw an error if the provider does not have a request function', async () => {
    windowSpy.mockImplementation(() => ({
      ethereum: {
        request: jest.fn()
        .mockResolvedValueOnce({})
      },
      removeEventListener: () => {}
    }));

    const provider = await connectWalletProvider({
      providerPreference: ConnectionProviders.METAMASK
    });

    // remove request function from provider
    delete provider.provider.request;

    await expect(switchWalletNetwork(provider, Network.POLYGON)).rejects.toThrow(new CheckoutError('provider object is missing request function', CheckoutErrorType.PROVIDER_REQUEST_MISSING_ERROR));
  })

  it('should request the user to add a new network if their wallet does not already have it', async () => {
    windowSpy.mockImplementation(() => ({
      ethereum: {
        request: jest.fn()
        .mockResolvedValueOnce({})
        .mockRejectedValueOnce(new Error("Unrecognized chain ID"))
      },
      removeEventListener: () => {}
    }));

    const provider = await connectWalletProvider({
      providerPreference: ConnectionProviders.METAMASK
    });

    await switchWalletNetwork(provider, Network.POLYGON);
    expect(provider.provider.request).toHaveBeenCalledWith({
        method: WALLET_ACTION.ADD_NETWORK, 
        params: [
          NetworkMap[Network.POLYGON]
        ]
    });
  });

  it('should throw an error when the user cancels an add network request', async () => {
    const requestMock = jest.fn()
    .mockResolvedValueOnce({}) // resolve for the connection request
    .mockRejectedValueOnce(new Error("Unrecognized chain ID")) // reject for the switch network request as chain is not addded yet
    .mockRejectedValueOnce(new Error()) // reject for the add network request - user cancels

    windowSpy.mockImplementation(() => ({
      ethereum: {
        request: requestMock
      },
      removeEventListener: () => {}
    }));

    const provider = await connectWalletProvider({
      providerPreference: ConnectionProviders.METAMASK
    });

    await expect(switchWalletNetwork(provider, Network.POLYGON)).rejects.toThrow(new CheckoutError('user cancelled the add network request', CheckoutErrorType.USER_REJECTED_REQUEST_ERROR));
    expect(provider.provider.request).toHaveBeenCalledWith({
      method: WALLET_ACTION.ADD_NETWORK, 
      params: [
        NetworkMap[Network.POLYGON]
      ]
    });
  });
});