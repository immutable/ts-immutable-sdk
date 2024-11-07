// this function needs to be in a separate file to prevent circular dependencies with ./network

import { BrowserProvider } from 'ethers';
import { CheckoutError, CheckoutErrorType, withCheckoutError } from '../errors';
import { CheckoutConfiguration } from '../config';
import {
  NetworkFilterTypes, ValidateProviderOptions, validateProviderDefaults,
} from '../types';
import { getNetworkAllowList } from '../network';
import { getUnderlyingChainId } from './getUnderlyingProvider';

export function isBrowserProvider(
  web3Provider: BrowserProvider,
): boolean {
  if (web3Provider && Boolean(web3Provider.send) && typeof web3Provider.send === 'function') {
    return true;
  }
  return false;
}

export async function validateProvider(
  config: CheckoutConfiguration,
  web3Provider: BrowserProvider,
  validateProviderOptions?: ValidateProviderOptions,
): Promise<BrowserProvider> {
  console.log('qwerqwerqwer')
  console.log(web3Provider)
  return withCheckoutError(
    async () => {
      if ((web3Provider.provider as any)?.isPassport) {
        // if Passport skip the validation checks
        return web3Provider;
      }
      if (!isBrowserProvider(web3Provider)) {
        throw new CheckoutError(
          'Parsed provider is not a valid BrowserProvider',
          CheckoutErrorType.WEB3_PROVIDER_ERROR,
        );
      }

      // this sets the default options and overrides them with any parsed options
      const options = {
        ...validateProviderDefaults,
        ...validateProviderOptions,
      };

      const underlyingChainId = await getUnderlyingChainId(web3Provider);
      let web3ChainId = web3Provider._network.chainId;

      try {
        web3ChainId = web3Provider._network.chainId;
        if (!web3ChainId) {
          web3ChainId = (await web3Provider.getNetwork()).chainId;
        }
      } catch (err) {
        throw new CheckoutError(
          'Unable to detect the web3Provider network',
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
      return web3Provider;
    },
    {
      type: CheckoutErrorType.WEB3_PROVIDER_ERROR,
    },
  );
}
