/* eslint-disable @typescript-eslint/no-explicit-any */
import { BrowserProvider } from 'ethers';
import {
  WalletAction, CheckConnectionResult,
} from '../types';
import { CheckoutError, CheckoutErrorType, withCheckoutError } from '../errors';

export async function checkIsWalletConnected(
  web3Provider: BrowserProvider,
): Promise<CheckConnectionResult> {
  if (!web3Provider?.send) {
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
    accounts = await web3Provider.send(WalletAction.CHECK_CONNECTION, []);
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

export async function connectSite(web3Provider: BrowserProvider): Promise<BrowserProvider> {
  if (!web3Provider || !web3Provider.send) {
    throw new CheckoutError(
      'Incompatible provider',
      CheckoutErrorType.PROVIDER_REQUEST_MISSING_ERROR,
      { details: 'Attempting to connect with an incompatible provider' },
    );
  }

  await withCheckoutError<void>(
    async () => {
      if (!web3Provider.send) return;
      // this makes the request to the wallet to connect i.e request eth accounts ('eth_requestAccounts')
      await web3Provider.send(WalletAction.CONNECT, []);
    },
    { type: CheckoutErrorType.USER_REJECTED_REQUEST_ERROR },
  );

  return web3Provider;
}

export async function requestPermissions(web3Provider: BrowserProvider): Promise<BrowserProvider> {
  if (!web3Provider || !web3Provider.send) {
    throw new CheckoutError(
      'Incompatible provider',
      CheckoutErrorType.PROVIDER_REQUEST_MISSING_ERROR,
      { details: 'Attempting to connect with an incompatible provider' },
    );
  }

  await withCheckoutError<void>(
    async () => {
      if (!web3Provider.send) return;

      await web3Provider.send(WalletAction.REQUEST_PERMISSIONS, [{ eth_accounts: {} }]);
    },
    { type: CheckoutErrorType.USER_REJECTED_REQUEST_ERROR },
  );

  return web3Provider;
}
