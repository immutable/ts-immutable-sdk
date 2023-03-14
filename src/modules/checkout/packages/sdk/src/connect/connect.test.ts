/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Web3Provider } from '@ethersproject/providers';
import { connectWalletProvider } from './connect'
import { ConnectProviderError, MetaMaskProviderError } from './errors';
import { ConnectionProviders } from './types'
import { UserRejectedRequestError, WALLET_ACTION } from '../types'

let windowSpy:any;

describe('connect', () => {

  beforeEach(() => {
    windowSpy = jest.spyOn(window, "window", "get");

    windowSpy.mockImplementation(() => ({
      ethereum: {
        request: jest.fn()
      },
      removeEventListener: () => {}
    }));
  });
  
  afterEach(() => {
    windowSpy.mockRestore();
  });

  it('should call the connect function with metamask and return a Web3Provider', async () => {
    const connRes = await connectWalletProvider({
      providerPreference: ConnectionProviders.METAMASK
    });

    expect(connRes).toBeInstanceOf(Web3Provider)
    expect(connRes?.provider).not.toBe(null);
    expect(connRes?.provider.request).toBeCalledWith({method: WALLET_ACTION.CONNECT, params: []});
  })

  it('should throw an error if connect is called with a preference that is not expected', async () => {
    try{
      await connectWalletProvider({
        providerPreference: 'trust-wallet' as ConnectionProviders
      })
    } catch(err){
      expect(err).toBeInstanceOf(ConnectProviderError)
    }
  })

  it('should throw an error if metamask provider is not found', async () => {
    windowSpy.mockImplementation(() => ({
      removeEventListener: () => {}
    }));
    try{
      await connectWalletProvider({
        providerPreference: ConnectionProviders.METAMASK
      })
    } catch(err){
      expect(err).toBeInstanceOf(MetaMaskProviderError)
    }
  })

  it('should throw an error if provider.request is not found', async () => {
    windowSpy.mockImplementation(() => ({
      ethereum: {
      },
      removeEventListener: () => {}
    }));
    try{
      await connectWalletProvider({
        providerPreference: ConnectionProviders.METAMASK
      })
    } catch(err){
      expect(err).toBeInstanceOf(MetaMaskProviderError)
    }
  })

  it('should throw an error if the user rejects the connection request', async () => {
    windowSpy.mockImplementation(() => ({
      ethereum: {
        request: jest.fn().mockRejectedValue(new Error("User rejected request"))
      },
      removeEventListener: () => {}
    }));
    try{
      await connectWalletProvider({
        providerPreference: ConnectionProviders.METAMASK
      })
    } catch(err){
      expect(err).toBeInstanceOf(UserRejectedRequestError)
    }
  })
})
