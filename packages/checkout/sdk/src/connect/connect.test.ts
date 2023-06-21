/*
 * @jest-environment jsdom
 */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Web3Provider } from '@ethersproject/providers';
import { checkIsWalletConnected, connectSite } from './connect';
import { WalletAction, WalletProviderName } from '../types';
import { CheckoutError, CheckoutErrorType } from '../errors';
import { createProvider } from '../provider';

let windowSpy: any;

describe('connect', () => {
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

  describe('checkIsWalletConnected', () => {
    it('should call request with eth_accounts method', async () => {
      providerRequestMock.mockResolvedValue([]);
      const provider = await createProvider(WalletProviderName.METAMASK);
      await checkIsWalletConnected(provider);
      expect(providerRequestMock).toBeCalledWith({
        method: WalletAction.CHECK_CONNECTION,
        params: [],
      });
    });

    it('should return isConnected as true when accounts array has an entry', async () => {
      // mock return array with active wallet address so we are connected
      providerRequestMock.mockResolvedValue(['0xmyWallet']);
      const provider = await createProvider(WalletProviderName.METAMASK);
      const checkConnection = await checkIsWalletConnected(provider);
      expect(checkConnection.isConnected).toBe(true);
      expect(checkConnection.walletAddress).toBe('0xmyWallet');
    });

    it('should return isConnected as false when no accounts returned', async () => {
      // mock return empty array of accounts so not connected
      providerRequestMock.mockResolvedValue([]);
      const provider = await createProvider(WalletProviderName.METAMASK);
      const checkConnection = await checkIsWalletConnected(provider);
      expect(checkConnection.isConnected).toBe(false);
      expect(checkConnection.walletAddress).toBe('');
    });
  });

  describe('connectWalletProvider', () => {
    it('should call the connect function with metamask and return a Web3Provider', async () => {
      const provider = await createProvider(WalletProviderName.METAMASK);
      const connRes = await connectSite(provider);

      expect(connRes).toBeInstanceOf(Web3Provider);
      expect(connRes?.provider).not.toBe(null);
      expect(connRes?.provider.request).toBeCalledWith({
        method: WalletAction.CONNECT,
        params: [],
      });
    });

    it('should throw an error if connect is called with a preference that is not expected', async () => {
      await expect(
        createProvider('trust-wallet' as WalletProviderName),
      ).rejects.toThrow(
        new CheckoutError(
          'Provider not supported',
          CheckoutErrorType.CONNECT_PROVIDER_ERROR,
        ),
      );
    });

    it('should throw an error if metamask provider is not found', async () => {
      windowSpy.mockImplementation(() => ({
        removeEventListener: () => {},
      }));

      await expect(
        createProvider(WalletProviderName.METAMASK),
      ).rejects.toThrow(
        new CheckoutError(
          '[METAMASK_PROVIDER_ERROR] Cause:window.addEventListener is not a function',
          CheckoutErrorType.METAMASK_PROVIDER_ERROR,
        ),
      );
    });

    it('should throw an error if provider.request is not found', async () => {
      windowSpy.mockImplementation(() => ({
        ethereum: {},
        removeEventListener: () => {},
      }));

      await expect(
        createProvider(WalletProviderName.METAMASK),
      ).rejects.toThrow(
        new CheckoutError(
          'No MetaMask provider installed.',
          CheckoutErrorType.METAMASK_PROVIDER_ERROR,
        ),
      );
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

      const provider = await createProvider(WalletProviderName.METAMASK);

      await expect(
        connectSite(provider),
      ).rejects.toThrow(
        new CheckoutError(
          '[USER_REJECTED_REQUEST_ERROR] Cause:User rejected request',
          CheckoutErrorType.USER_REJECTED_REQUEST_ERROR,
        ),
      );
    });
  });
});
