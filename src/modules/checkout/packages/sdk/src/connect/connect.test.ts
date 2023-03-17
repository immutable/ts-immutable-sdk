/*
 * @jest-environment jsdom
 */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Web3Provider } from '@ethersproject/providers';
import { connectWalletProvider } from './connect';
import { ConnectionProviders } from './types';
import { WALLET_ACTION } from '../types';
import { CheckoutError, CheckoutErrorType } from '../errors/checkoutError';

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
  });

  it('should throw an error if connect is called with a preference that is not expected', async () => {
    await expect(connectWalletProvider({
      providerPreference: 'trust-wallet' as ConnectionProviders
    })).rejects.toThrow(new CheckoutError('Provider preference was not detected', CheckoutErrorType.CONNECT_PROVIDER_ERROR));
  });

  it('should throw an error if metamask provider is not found', async () => {
    windowSpy.mockImplementation(() => ({
      removeEventListener: () => {}
    }));

    await expect(connectWalletProvider({
      providerPreference: ConnectionProviders.METAMASK
    })).rejects.toThrow(new CheckoutError('window.addEventListener is not a function', CheckoutErrorType.METAMASK_PROVIDER_ERROR));
  });

  it('should throw an error if provider.request is not found', async () => {
    windowSpy.mockImplementation(() => ({
      ethereum: {
      },
      removeEventListener: () => {}
    }));

    await expect(connectWalletProvider({
      providerPreference: ConnectionProviders.METAMASK
    })).rejects.toThrow(new CheckoutError('No MetaMask provider installed.', CheckoutErrorType.METAMASK_PROVIDER_ERROR));
  });

  it('should throw an error if the user rejects the connection request', async () => {
    windowSpy.mockImplementation(() => ({
      ethereum: {
        request: jest.fn().mockRejectedValue(new Error("User rejected request"))
      },
      removeEventListener: () => {}
    }));

    await expect(connectWalletProvider({
      providerPreference: ConnectionProviders.METAMASK
    })).rejects.toThrow(new CheckoutError('User rejected request', CheckoutErrorType.USER_REJECTED_REQUEST_ERROR));
  })
})
