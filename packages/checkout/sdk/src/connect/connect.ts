/* eslint-disable @typescript-eslint/no-explicit-any */
import { Web3Provider } from '@ethersproject/providers';
import {
  WalletAction, CheckConnectionResult,
} from '../types';
import { CheckoutError, CheckoutErrorType, withCheckoutError } from '../errors';

export async function checkIsWalletConnected(
  web3Provider: Web3Provider,
): Promise<CheckConnectionResult> {
  if (!web3Provider?.provider?.request) {
    throw new CheckoutError(
      'Check wallet connection request failed',
      CheckoutErrorType.PROVIDER_REQUEST_FAILED_ERROR,
      {
        rpcMethod: WalletAction.CHECK_CONNECTION,
      },
    );
  }
  let accounts = [];
  try {
    accounts = await web3Provider.provider.request({
      method: WalletAction.CHECK_CONNECTION,
      params: [],
    });
  } catch (err: any) {
    throw new CheckoutError(
      'Check wallet connection request failed',
      CheckoutErrorType.PROVIDER_REQUEST_FAILED_ERROR,
      {
        error: err,
        rpcMethod: WalletAction.CHECK_CONNECTION,
      },
    );
  }
  // accounts[0] will have the active account if connected.

  return {
    isConnected: accounts && accounts.length > 0,
    walletAddress: accounts[0] ?? '',
  };
}

export async function connectSite(web3Provider: Web3Provider): Promise<Web3Provider> {
  if (!web3Provider || !web3Provider.provider?.request) {
    throw new CheckoutError(
      'Incompatible provider',
      CheckoutErrorType.PROVIDER_REQUEST_MISSING_ERROR,
      { details: 'Attempting to connect with an incompatible provider' },
    );
  }

  await withCheckoutError<void>(
    async () => {
      if (!web3Provider.provider.request) return;
      // this makes the request to the wallet to connect i.e request eth accounts ('eth_requestAccounts')
      await web3Provider.provider.request({
        method: WalletAction.CONNECT,
        params: [],
      });
    },
    { type: CheckoutErrorType.USER_REJECTED_REQUEST_ERROR },
  );

  return web3Provider;
}

export async function requestPermissions(web3Provider: Web3Provider): Promise<Web3Provider> {
  if (!web3Provider || !web3Provider.provider?.request) {
    throw new CheckoutError(
      'Incompatible provider',
      CheckoutErrorType.PROVIDER_REQUEST_MISSING_ERROR,
      { details: 'Attempting to connect with an incompatible provider' },
    );
  }

  await withCheckoutError<void>(
    async () => {
      if (!web3Provider.provider.request) return;

      await web3Provider.provider.request({
        method: WalletAction.REQUEST_PERMISSIONS,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        params: [{ eth_accounts: {} }],
      });
    },
    { type: CheckoutErrorType.USER_REJECTED_REQUEST_ERROR },
  );

  return web3Provider;
}
