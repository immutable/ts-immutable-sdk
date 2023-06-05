/* eslint-disable @typescript-eslint/no-explicit-any */
import detectEthereumProvider from '@metamask/detect-provider';
import { Web3Provider, ExternalProvider } from '@ethersproject/providers';
import {
  ConnectionProviders,
  WalletAction,
  CheckConnectionResult,
} from '../types';
import { CheckoutError, CheckoutErrorType, withCheckoutError } from '../errors';

async function getMetaMaskProvider(): Promise<Web3Provider> {
  const provider = await withCheckoutError<ExternalProvider | null>(
    async () => await detectEthereumProvider(),
    { type: CheckoutErrorType.METAMASK_PROVIDER_ERROR },
  );

  if (!provider || !provider.request) {
    throw new CheckoutError(
      'No MetaMask provider installed.',
      CheckoutErrorType.METAMASK_PROVIDER_ERROR,
    );
  }

  return new Web3Provider(provider);
}

export async function getWalletProviderForPreference(
  providerPreference: ConnectionProviders,
): Promise<Web3Provider> {
  let web3Provider: Web3Provider | null = null;
  switch (providerPreference) {
    case ConnectionProviders.METAMASK: {
      web3Provider = await getMetaMaskProvider();
      break;
    }
    default:
      throw new CheckoutError(
        'Provider preference is not supported',
        CheckoutErrorType.PROVIDER_PREFERENCE_ERROR,
      );
  }
  return web3Provider;
}

export async function checkIsWalletConnected(
  provider: Web3Provider,
): Promise<CheckConnectionResult> {
  if (!provider.provider?.request) {
    throw new CheckoutError(
      'Incompatible provider',
      CheckoutErrorType.PROVIDER_REQUEST_MISSING_ERROR,
      { details: 'Unsupported provider' },
    );
  }

  let accounts = [];
  try {
    accounts = await provider.provider.request({
      method: WalletAction.CHECK_CONNECTION,
      params: [],
    });
  } catch (err: any) {
    throw new CheckoutError(
      'Check wallet connection request failed',
      CheckoutErrorType.PROVIDER_REQUEST_FAILED_ERROR,
      {
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

export async function connectWalletProvider(
  provider: Web3Provider,
): Promise<Web3Provider> {
  await withCheckoutError<void>(
    async () => {
      if (!provider || !provider?.provider?.request) {
        throw new CheckoutError(
          'Incompatible provider',
          CheckoutErrorType.PROVIDER_REQUEST_MISSING_ERROR,
          { details: 'Unsupported provider' },
        );
      }
      // this makes the request to the wallet to connect i.e request eth accounts ('eth_requestAccounts')
      await provider.provider.request({
        method: WalletAction.CONNECT,
        params: [],
      });
    },
    { type: CheckoutErrorType.USER_REJECTED_REQUEST_ERROR },
  );

  return provider;
}
