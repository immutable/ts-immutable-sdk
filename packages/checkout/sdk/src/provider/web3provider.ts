/* eslint-disable @typescript-eslint/no-explicit-any */
import { Web3Provider } from '@ethersproject/providers';
import {
  Providers,
  CurrentProviderInfo,
  CachedProvider,
  ProviderParams,
} from '../types';
import { CheckoutError, CheckoutErrorType } from '../errors';
import { CheckoutConfiguration } from '../config';

export function isWeb3Provider(
  provider: Web3Provider | CachedProvider | undefined,
): boolean {
  if (provider && provider instanceof Web3Provider) {
    return true;
  }
  return false;
}

export function isCachedProvider(
  provider: Web3Provider | CachedProvider | undefined,
): boolean {
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
  config: CheckoutConfiguration,
  params: ProviderParams,
  currentProviderInfo: CurrentProviderInfo,
  allProviders: Providers,
  allowUnsupportedNetworks: boolean = true,
): Promise<Web3Provider> {
  const { provider } = params;

  // if they've supplied a web3provider, use it
  if (isWeb3Provider(provider)) {
    // TODO: is the provider on a supported network
    if (allowUnsupportedNetworks === false && currentProviderInfo.network && !currentProviderInfo.network.isSupported) {
      throw new CheckoutError(
        'Your current network is not supported, please switch network',
        CheckoutErrorType.WEB3_PROVIDER_ERROR,
      );
    }
    return provider as Web3Provider;
  }

  if (!allProviders) {
    throw new CheckoutError(
      'Checkout.setProvider({Web3Provider, Name}) needs to be called to set the providers for all available networks.',
      CheckoutErrorType.PROVIDER_ERROR,
    );
  }

  // if we've already cloned the providers use the cached one they're requesting
  if (isCachedProvider(provider) && allProviders) {
    const { chainId, name } = provider as CachedProvider;
    if (allProviders[name] && allProviders[name][chainId]) {
      return allProviders[name][chainId];
    }
  }

  // TODO: is the provider on a supported network
  if (allowUnsupportedNetworks === false && currentProviderInfo.network && !currentProviderInfo.network.isSupported) {
    throw new CheckoutError(
      'Your current network is not supported, please switch network',
      CheckoutErrorType.WEB3_PROVIDER_ERROR,
    );
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
