import { Web3Provider } from '@ethersproject/providers';
import { switchWalletNetwork } from './network'
import { UserRejectedRequestError, WALLET_ACTION } from '../types'
import { ConnectionProviders, connectWalletProvider } from '../connect';
import { Network, NetworkMap } from './types';
import { NetworkNotSupportedError } from './errors';


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
    try{
      await switchWalletNetwork(provider, 'Fantom' as Network);
    } catch(err: any) {
      expect(err).toBeInstanceOf(NetworkNotSupportedError);
      expect(err.message).toEqual("Fantom is not a supported network");
    }
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

    try{
      await switchWalletNetwork(provider, Network.POLYGON);
    } catch(err: any) {
      expect(err).toBeInstanceOf(UserRejectedRequestError);
      expect(err.message).toEqual("user cancelled the switch network request");
    }
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

    try{
      await switchWalletNetwork(provider, Network.POLYGON);
    } catch(err: any) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toEqual("provider object is missing request function");
    }
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

    try{
      await switchWalletNetwork(provider, Network.POLYGON);
      expect(provider.provider.request).toHaveBeenCalledWith(
        {
          method: WALLET_ACTION.ADD_NETWORK, 
          params: [
            NetworkMap[Network.ETHEREUM]
          ]
        }
      );
    } catch(err: any) {
    }
  })

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

    try{
      await switchWalletNetwork(provider, Network.POLYGON);
      expect(provider.provider.request).toHaveBeenCalledWith(
        {
          method: WALLET_ACTION.ADD_NETWORK, 
          params: [
            NetworkMap[Network.ETHEREUM]
          ]
        }
      );
    } catch(err: any) {
      expect(err).toBeInstanceOf(UserRejectedRequestError);
      expect(err.message).toEqual("user cancelled the add network request");
    }
  })
})