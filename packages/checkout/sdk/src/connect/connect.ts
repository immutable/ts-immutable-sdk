/* eslint-disable @typescript-eslint/no-explicit-any */
import detectEthereumProvider from '@metamask/detect-provider';
import {
  ConnectionProviders,
  ConnectParams,
  WALLET_ACTION,
  CheckConnectionResult,
} from '../types';
import { Web3Provider, ExternalProvider } from '@ethersproject/providers';
import { CheckoutError, CheckoutErrorType, withCheckoutError } from '../errors';

export async function checkIsWalletConnected(
  providerPreference: ConnectionProviders
): Promise<CheckConnectionResult> {
  const provider = await getWalletProviderForPreference(providerPreference);

  if (!provider.provider?.request) {
    throw new CheckoutError(
      'Incompatible provider',
      CheckoutErrorType.PROVIDER_REQUEST_MISSING_ERROR,
      { details: `Unsupported provider for ${providerPreference}` }
    );
  }

  let accounts = [];
  try {
    accounts = await provider.provider.request({
      method: WALLET_ACTION.CHECK_CONNECTION,
      params: [],
    });
  } catch (err: any) {
    throw new CheckoutError(
      `Check wallet connection request failed`,
      CheckoutErrorType.PROVIDER_REQUEST_FAILED_ERROR,
      {
        rpcMethod: WALLET_ACTION.CHECK_CONNECTION,
      }
    );
  }
  // accounts[0] will have the active account if connected.

  return {
    isConnected: accounts && accounts.length > 0,
    walletAddress: accounts[0] ?? '',
  };
}

export async function connectWalletProvider(
  params: ConnectParams
): Promise<Web3Provider> {
  const web3Provider = await getWalletProviderForPreference(
    params.providerPreference
  );

  await withCheckoutError<void>(
    async () => {
      if (!web3Provider || !web3Provider?.provider?.request) {
        throw new CheckoutError(
          'Incompatible provider',
          CheckoutErrorType.PROVIDER_REQUEST_MISSING_ERROR,
          { details: `Unsupported provider for ${params.providerPreference}` }
        );
      }
      // this makes the request to the wallet to connect i.e request eth accounts ('eth_requestAccounts')
      await web3Provider.provider.request({
        method: WALLET_ACTION.CONNECT,
        params: [],
      });
    },
    { type: CheckoutErrorType.USER_REJECTED_REQUEST_ERROR }
  );

  return web3Provider;
}

export async function getWalletProviderForPreference(
  providerPreference: ConnectionProviders
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
        CheckoutErrorType.PROVIDER_PREFERENCE_ERROR
      );
  }
  return web3Provider;
}

export async function getMetaMaskProvider(): Promise<Web3Provider> {
  const provider = await withCheckoutError<ExternalProvider | null>(
    async () => {
      return await detectEthereumProvider();
    },
    { type: CheckoutErrorType.METAMASK_PROVIDER_ERROR }
  );

  if (!provider || !provider.request)
    throw new CheckoutError(
      'No MetaMask provider installed.',
      CheckoutErrorType.METAMASK_PROVIDER_ERROR
    );

  return new Web3Provider(provider);
}
