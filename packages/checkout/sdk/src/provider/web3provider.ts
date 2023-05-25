/* eslint-disable @typescript-eslint/no-explicit-any */
import { Web3Provider } from '@ethersproject/providers';
import { ConnectParams, Providers, CurrentProviderInfo } from '../types';
import { CheckoutError, CheckoutErrorType } from '../errors';

// @NOTE - This is split out from the main provider file to avoid circular dependencies

export async function getWeb3Provider(
  params: ConnectParams,
  currentProviderInfo: CurrentProviderInfo,
  allProviders: Providers,
): Promise<Web3Provider> {
  const { web3Provider, cachedProvider } = params;

  // if they've supplied a web3provider, use it
  if (web3Provider) return web3Provider;

  // if we've already cloned the providers use the cached one they're requesting
  if (cachedProvider && allProviders) {
    const { chainId, name } = cachedProvider;
    if (allProviders[name] && allProviders[name][chainId]) {
      return allProviders[name][chainId];
    }
  }

  // otherwise use the current provider as set in the Checkout class
  if (allProviders && currentProviderInfo.name && currentProviderInfo.network) {
    const { name, network } = currentProviderInfo;
    const { chainId } = network;
    if (allProviders[name] && allProviders[name][chainId]) {
      return allProviders[name][chainId];
    }
  }

  throw new CheckoutError(
    'unable to retrieve a valid web3Provider',
    CheckoutErrorType.WEB3_PROVIDER_ERROR,
  );
}
