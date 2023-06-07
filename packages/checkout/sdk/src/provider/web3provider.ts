// this function needs to be in a separate file to prevent circular dependencies with ./network

import { Web3Provider } from '@ethersproject/providers';
import { CheckoutError, CheckoutErrorType, withCheckoutError } from '../errors';
import { CheckoutConfiguration } from '../config';
import {
  NetworkFilterTypes, ValidateProviderOptions, validateProviderDefaults,
} from '../types';
import { getNetworkAllowList } from '../network';
import { getUnderlyingChainId } from './getUnderlyingProvider';

export function isWeb3Provider(
  provider: Web3Provider,
): boolean {
  if (provider && provider instanceof Web3Provider && provider.provider?.request) {
    return true;
  }
  return false;
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

      const underlyingChainId = await getUnderlyingChainId(parsedProvider);

      if (parsedProvider.network.chainId !== underlyingChainId && !options.allowMistmatchedChainId) {
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
      return parsedProvider;
    },
    {
      type: CheckoutErrorType.WEB3_PROVIDER_ERROR,
    },
  );
}
