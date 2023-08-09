/*
 * @jest-environment jsdom
 */
import { Web3Provider } from '@ethersproject/providers';
import { connectSite } from '../connect';
import { CheckoutErrorType } from '../errors';
import { WalletProviderName } from '../types';
import { createProvider } from './provider';

let windowSpy: any;

describe('createProvider', () => {
  const providerRequestMock: jest.Mock = jest.fn();

  beforeEach(() => {
    windowSpy = jest.spyOn(window, 'window', 'get');

    windowSpy.mockImplementation(() => ({
      ethereum: {
        request: providerRequestMock,
      },
      removeEventListener: () => {},
    }));
  });

  afterEach(() => {
    windowSpy.mockRestore();
  });

  it('should call the connect function with metamask and return a Web3Provider', async () => {
    const { provider } = await createProvider(WalletProviderName.METAMASK);

    expect(provider).toBeInstanceOf(Web3Provider);
    expect(provider).not.toBe(null);
  });

  it('should throw an error if connect is called with a preference that is not expected', async () => {
    try {
      await createProvider('trust-wallet' as WalletProviderName);
    } catch (err: any) {
      expect(err.message).toEqual('Provider not supported');
      expect(err.type).toEqual(CheckoutErrorType.DEFAULT_PROVIDER_ERROR);
    }
  });

  it('should throw an error if metamask provider is not found', async () => {
    windowSpy.mockImplementation(() => ({
      removeEventListener: () => {},
    }));

    try {
      await createProvider(WalletProviderName.METAMASK);
    } catch (err: any) {
      expect(err.message).toEqual('[METAMASK_PROVIDER_ERROR] Cause:window.addEventListener is not a function');
      expect(err.type).toEqual(CheckoutErrorType.METAMASK_PROVIDER_ERROR);
    }
  });

  it('should throw an error if provider.request is not found', async () => {
    windowSpy.mockImplementation(() => ({
      ethereum: {},
      removeEventListener: () => {},
    }));

    try {
      await createProvider(WalletProviderName.METAMASK);
    } catch (err: any) {
      expect(err.message).toEqual('No MetaMask provider installed.');
      expect(err.type).toEqual(CheckoutErrorType.METAMASK_PROVIDER_ERROR);
    }
  });

  it('should throw an error if the user rejects the connection request', async () => {
    windowSpy.mockImplementation(() => ({
      ethereum: {
        request: jest
          .fn()
          .mockRejectedValue(new Error('User rejected request')),
      },
      removeEventListener: () => {},
    }));

    const { provider } = await createProvider(WalletProviderName.METAMASK);

    try {
      await connectSite(provider);
    } catch (err: any) {
      expect(err.message).toEqual('[USER_REJECTED_REQUEST_ERROR] Cause:User rejected request');
      expect(err.type).toEqual(CheckoutErrorType.USER_REJECTED_REQUEST_ERROR);
    }
  });
});
