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
  web3Provider: Web3Provider,
): boolean {
  if (web3Provider && web3Provider instanceof Web3Provider && web3Provider.provider?.request) {
    return true;
  }
  return false;
}

export async function validateProvider(
  config: CheckoutConfiguration,
  web3Provider: Web3Provider,
  validateProviderOptions?: ValidateProviderOptions,
): Promise<Web3Provider> {
  return withCheckoutError(
    async () => {
      if (!isWeb3Provider(web3Provider)) {
        throw new CheckoutError(
          'Parsed provider is not a valid Web3Provider',
          CheckoutErrorType.WEB3_PROVIDER_ERROR,
        );
      }

      // this sets the default options and overrides them with any parsed options
      const options = {
        ...validateProviderDefaults,
        ...validateProviderOptions,
      };

      const underlyingChainId = await getUnderlyingChainId(web3Provider);
      let web3ChainId:number = web3Provider.network?.chainId;

      try {
        web3ChainId = web3Provider.network?.chainId;
        if (!web3ChainId) {
          web3ChainId = (await web3Provider.getNetwork()).chainId;
        }
      } catch (err) {
        throw new CheckoutError(
          'Unable to detect the web3Provider network',
          CheckoutErrorType.WEB3_PROVIDER_ERROR,
        );
      }

      if (web3ChainId !== underlyingChainId && !options.allowMistmatchedChainId) {
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
