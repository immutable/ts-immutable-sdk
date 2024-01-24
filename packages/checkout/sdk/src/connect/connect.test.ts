/*
 * @jest-environment jsdom
 */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Web3Provider } from '@ethersproject/providers';
import { checkIsWalletConnected, connectSite, requestPermissions } from './connect';
import { WalletAction, WalletProviderName } from '../types';
import { CheckoutErrorType } from '../errors';
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
      const { provider, walletProviderName } = await createProvider(WalletProviderName.METAMASK);
      await checkIsWalletConnected(provider);
      expect(providerRequestMock).toBeCalledWith({
        method: WalletAction.CHECK_CONNECTION,
        params: [],
      });
      expect(walletProviderName).toEqual(WalletProviderName.METAMASK);
    });

    it('should return isConnected as true when accounts array has an entry', async () => {
      // mock return array with active wallet address so we are connected
      providerRequestMock.mockResolvedValue(['0xmyWallet']);
      const { provider, walletProviderName } = await createProvider(WalletProviderName.METAMASK);
      const checkConnection = await checkIsWalletConnected(provider);
      expect(checkConnection.isConnected).toBe(true);
      expect(checkConnection.walletAddress).toBe('0xmyWallet');
      expect(walletProviderName).toEqual(WalletProviderName.METAMASK);
    });

    it('should return isConnected as false when no accounts returned', async () => {
      // mock return empty array of accounts so not connected
      providerRequestMock.mockResolvedValue([]);
      const { provider, walletProviderName } = await createProvider(WalletProviderName.METAMASK);
      const checkConnection = await checkIsWalletConnected(provider);
      expect(checkConnection.isConnected).toBe(false);
      expect(checkConnection.walletAddress).toBe('');
      expect(walletProviderName).toEqual(WalletProviderName.METAMASK);
    });

    it('should throw an error if provider missing from web3provider', async () => {
      try {
        await checkIsWalletConnected({} as Web3Provider);
      } catch (err: any) {
        expect(err.message).toEqual('Check wallet connection request failed');
        expect(err.type).toEqual(CheckoutErrorType.PROVIDER_REQUEST_FAILED_ERROR);
      }
    });

    it('should throw an error if provider.request is not found', async () => {
      try {
        await checkIsWalletConnected({ provider: {} } as Web3Provider);
      } catch (err: any) {
        expect(err.message).toEqual('Check wallet connection request failed');
        expect(err.type).toEqual(CheckoutErrorType.PROVIDER_REQUEST_FAILED_ERROR);
      }
    });

    it('should throw error if request throws an error', async () => {
      try {
        await checkIsWalletConnected({
          provider: {
            request: () => { throw new Error(''); },
          },
        } as unknown as Web3Provider);
      } catch (err: any) {
        expect(err.message).toEqual('Check wallet connection request failed');
        expect(err.type).toEqual(CheckoutErrorType.PROVIDER_REQUEST_FAILED_ERROR);
      }
    });
  });

  describe('connectWalletProvider', () => {
    it('should call the connect function with metamask and return a Web3Provider', async () => {
      const { provider } = await createProvider(WalletProviderName.METAMASK);
      const connRes = await connectSite(provider);

      expect(connRes).toBeInstanceOf(Web3Provider);
      expect(connRes?.provider).not.toBe(null);
      expect(connRes?.provider.request).toBeCalledWith({
        method: WalletAction.CONNECT,
        params: [],
      });
    });

    it('should throw an error if provider missing from web3provider', async () => {
      try {
        await connectSite({} as Web3Provider);
      } catch (err: any) {
        expect(err.message).toEqual('Incompatible provider');
        expect(err.type).toEqual(CheckoutErrorType.PROVIDER_REQUEST_MISSING_ERROR);
        expect(err.data.details).toEqual('Attempting to connect with an incompatible provider');
      }
    });

    it('should throw an error if provider.request is not found', async () => {
      try {
        await connectSite({ provider: {} } as Web3Provider);
      } catch (err: any) {
        expect(err.message).toEqual('Incompatible provider');
        expect(err.type).toEqual(CheckoutErrorType.PROVIDER_REQUEST_MISSING_ERROR);
        expect(err.data.details).toEqual('Attempting to connect with an incompatible provider');
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

  describe('requestPermissions', () => {
    it('should call the requestPermissions function with metamask and return a Web3Provider', async () => {
      const { provider } = await createProvider(WalletProviderName.METAMASK);
      const reqRes = await requestPermissions(provider);

      expect(reqRes).toBeInstanceOf(Web3Provider);
      expect(reqRes?.provider).not.toBe(null);
      expect(reqRes?.provider.request).toBeCalledWith({
        method: WalletAction.REQUEST_PERMISSIONS,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        params: [{ eth_accounts: {} }],
      });
    });

    it('should throw an error if provider missing from web3provider', async () => {
      try {
        await requestPermissions({} as Web3Provider);
      } catch (err: any) {
        expect(err.message).toEqual('Incompatible provider');
        expect(err.type).toEqual(CheckoutErrorType.PROVIDER_REQUEST_MISSING_ERROR);
        expect(err.data.details).toEqual('Attempting to connect with an incompatible provider');
      }
    });

    it('should throw an error if provider.request is not found', async () => {
      try {
        await requestPermissions({ provider: {} } as Web3Provider);
      } catch (err: any) {
        expect(err.message).toEqual('Incompatible provider');
        expect(err.type).toEqual(CheckoutErrorType.PROVIDER_REQUEST_MISSING_ERROR);
        expect(err.data.details).toEqual('Attempting to connect with an incompatible provider');
      }
    });

    it('should throw an error if the user rejects the permission request', async () => {
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
        await requestPermissions(provider);
      } catch (err: any) {
        expect(err.message).toEqual('[USER_REJECTED_REQUEST_ERROR] Cause:User rejected request');
        expect(err.type).toEqual(CheckoutErrorType.USER_REJECTED_REQUEST_ERROR);
      }
    });
  });
});
