// this function needs to be in a separate file to prevent circular dependencies with ./network

import { Eip1193Provider } from 'ethers';
import { CheckoutError, CheckoutErrorType, withCheckoutError } from '../errors';
import { CheckoutConfiguration } from '../config';
import {
  WrappedBrowserProvider,
  NetworkFilterTypes, ValidateProviderOptions, validateProviderDefaults,
} from '../types';
import { getNetworkAllowList } from '../network';
import { getUnderlyingChainId } from './getUnderlyingProvider';

export function isWrappedBrowserProvider(
  browserProvider: WrappedBrowserProvider | Eip1193Provider,
): boolean {
  return browserProvider && 'send' in browserProvider && typeof browserProvider.send === 'function';
}

export async function validateProvider(
  config: CheckoutConfiguration,
  browserProvider: WrappedBrowserProvider | Eip1193Provider,
  validateProviderOptions?: ValidateProviderOptions,
): Promise<WrappedBrowserProvider> {
  return withCheckoutError(
    async () => {
      if ('request' in browserProvider) {
        return new WrappedBrowserProvider(browserProvider);
      }

      if (browserProvider.ethereumProvider?.isPassport) {
        // if Passport skip the validation checks
        return browserProvider;
      }

      // this sets the default options and overrides them with any parsed options
      const options = {
        ...validateProviderDefaults,
        ...validateProviderOptions,
      };

      const underlyingChainId = await getUnderlyingChainId(browserProvider);
      let web3ChainId = (await browserProvider.getNetwork()).chainId;

      try {
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
