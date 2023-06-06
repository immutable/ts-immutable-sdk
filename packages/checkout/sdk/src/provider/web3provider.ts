/* eslint-disable @typescript-eslint/no-explicit-any */
import { Web3Provider } from '@ethersproject/providers';
import { CheckoutError, CheckoutErrorType, withCheckoutError } from '../errors';
import { CheckoutConfiguration } from '../config';
import { NetworkInfo, ValidateProviderOptions, validateProviderDefaults } from '../types';
import { getNetworkInfo } from '../network';

export function isWeb3Provider(
  provider: Web3Provider,
): boolean {
  if (provider && provider instanceof Web3Provider) {
    return true;
  }
  return false;
}

export function isCachedProvider(
  provider: Web3Provider,
): boolean {
  if (provider && !(provider instanceof Web3Provider)) {
    const { chainId, name } = provider;
    if (chainId && name) {
      return true;
    }
  }
  return false;
}

// this gives us access to the properties of the underlying provider object
export function getUnderlyingChainId(provider:Web3Provider) {
  const providerProxy = new Proxy(provider.provider, {
    get(target:any, property:any) {
      return target[property];
    },
  });
  return parseInt(providerProxy.chainId, 16);
}

export async function validateProvider(
  config: CheckoutConfiguration,
  parsedProvider: Web3Provider,
  parsedOptions?: ValidateProviderOptions,
): Promise<Web3Provider> {
  return withCheckoutError(
    async () => {
      if (!isWeb3Provider(parsedProvider)) {
        throw new CheckoutError(
          'Parsed provider is not a valid Web3Provider',
          CheckoutErrorType.WEB3_PROVIDER_ERROR,
        );
      }

      // this sets the default options and overrides them with any parsed options
      const options = {
        ...validateProviderDefaults,
        ...parsedOptions,
      };

      const underlyingChainId = getUnderlyingChainId(parsedProvider);

      // this is only used for the switch network check currently
      // without this you can't switch to a valid network if you changed it manually
      // since the underlying provider's chainId is mismatching the web3provider network
      let provider:Web3Provider;
      if (parsedProvider.network.chainId !== underlyingChainId && options.fixMixmatchedChain) {
        provider = new Web3Provider(parsedProvider.provider, underlyingChainId);
      } else {
        provider = parsedProvider;
      }

      let networkInfo:NetworkInfo;
      try {
        // this tests the underlying network hasn't been manually changed
        networkInfo = await getNetworkInfo(config, provider);
      } catch (err) {
        throw new CheckoutError(
          'Your wallet has changed network, please switch to a supported network',
          CheckoutErrorType.WEB3_PROVIDER_ERROR,
        );
      }

      if (!networkInfo.isSupported) {
        if (options.allowUnsupportedProvider === false) {
          throw new CheckoutError(
            'Your current network is not supported, please switch network',
            CheckoutErrorType.WEB3_PROVIDER_ERROR,
          );
        }
      }
      return provider;
    },
    {
      type: CheckoutErrorType.WEB3_PROVIDER_ERROR,
    },
  );
}
