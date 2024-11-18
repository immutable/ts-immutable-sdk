// this function needs to be in a separate file to prevent circular dependencies with ./network

import { CheckoutError, CheckoutErrorType, withCheckoutError } from '../errors';
import { CheckoutConfiguration } from '../config';
import {
  NamedBrowserProvider,
  NetworkFilterTypes, ValidateProviderOptions, WalletProviderName, validateProviderDefaults,
} from '../types';
import { getNetworkAllowList } from '../network';
import { getUnderlyingChainId } from './getUnderlyingProvider';

export function isNamedBrowserProvider(
  browserProvider: NamedBrowserProvider,
): boolean {
  if (browserProvider && Boolean(browserProvider.send) && typeof browserProvider.send === 'function') {
    return true;
  }
  return false;
}

export async function validateProvider(
  config: CheckoutConfiguration,
  browserProvider: NamedBrowserProvider,
  validateProviderOptions?: ValidateProviderOptions,
): Promise<NamedBrowserProvider> {
  return withCheckoutError(
    async () => {
      if (browserProvider.name === WalletProviderName.PASSPORT) {
        // if Passport skip the validation checks
        return browserProvider;
      }
      if (!isNamedBrowserProvider(browserProvider)) {
        throw new CheckoutError(
          'Parsed provider is not a valid NamedBrowserProvider',
          CheckoutErrorType.WEB3_PROVIDER_ERROR,
        );
      }

      // this sets the default options and overrides them with any parsed options
      const options = {
        ...validateProviderDefaults,
        ...validateProviderOptions,
      };

      const underlyingChainId = await getUnderlyingChainId(browserProvider);
      let web3ChainId = (await browserProvider.getNetwork()).chainId;

      try {
        web3ChainId = (await browserProvider.getNetwork()).chainId;
        if (!web3ChainId) {
          web3ChainId = (await browserProvider.getNetwork()).chainId;
        }
      } catch (err) {
        throw new CheckoutError(
          'Unable to detect the browserProvider network',
          CheckoutErrorType.WEB3_PROVIDER_ERROR,
          { error: err },
        );
      }

      if (web3ChainId !== BigInt(underlyingChainId) && !options.allowMistmatchedChainId) {
        // eslint-disable-next-line no-console
        console.error('web3ChainId', web3ChainId, 'underlyingChainId', underlyingChainId, options);
        throw new CheckoutError(
          'Your wallet has changed network, please switch to a supported network',
          CheckoutErrorType.WEB3_PROVIDER_ERROR,
        );
      }

      const allowedNetworks = await getNetworkAllowList(config, {
        type: NetworkFilterTypes.ALL,
      });

      const isAllowed = allowedNetworks.networks.some((network) => network.chainId === underlyingChainId);

      if (!isAllowed && !options.allowUnsupportedProvider) {
        throw new CheckoutError(
          'Your wallet is connected to an unsupported network, please switch to a supported network',
          CheckoutErrorType.WEB3_PROVIDER_ERROR,
        );
      }
      return browserProvider;
    },
    {
      type: CheckoutErrorType.WEB3_PROVIDER_ERROR,
    },
  );
}
