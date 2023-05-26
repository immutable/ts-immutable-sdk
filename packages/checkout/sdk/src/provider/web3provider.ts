/* eslint-disable @typescript-eslint/no-explicit-any */
import { Web3Provider } from '@ethersproject/providers';
import {
  ConnectParams,
  Providers,
  CurrentProviderInfo,
  CachedProvider,
} from '../types';
import { CheckoutError, CheckoutErrorType } from '../errors';

export function isWeb3Provider(
  provider: Web3Provider | CachedProvider | undefined,
) {
  return provider && provider instanceof Web3Provider;
}

export function isCachedProvider(
  provider: Web3Provider | CachedProvider | undefined,
) {
  if (provider && !(provider instanceof Web3Provider)) {
    const { chainId, name } = provider;
    if (chainId && name) {
      return true;
    }
  }
  return false;
}

// @NOTE - This is split out from the main provider file to avoid circular dependencies

export async function getWeb3Provider(
  params: ConnectParams,
  currentProviderInfo: CurrentProviderInfo,
  allProviders: Providers,
): Promise<Web3Provider> {
  const { provider } = params;

  // if they've supplied a web3provider, use it
  if (isWeb3Provider(provider)) return provider as Web3Provider;

  // if we've already cloned the providers use the cached one they're requesting
  if (isCachedProvider(provider) && allProviders) {
    const { chainId, name } = provider as CachedProvider;
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
