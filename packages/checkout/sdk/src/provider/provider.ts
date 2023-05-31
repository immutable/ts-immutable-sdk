/* eslint-disable @typescript-eslint/no-explicit-any */
import detectEthereumProvider from '@metamask/detect-provider';
import { Web3Provider, ExternalProvider } from '@ethersproject/providers';
import {
  ChainId,
  DefaultProviders,
  GenericProvider,
  NetworkFilterTypes,
  NetworkInfo,
  ProviderForChain,
  Providers,
} from '../types';
import { CheckoutError, CheckoutErrorType, withCheckoutError } from '../errors';
import { CheckoutConfiguration } from '../config';
import { getNetworkAllowList, getNetworkInfo } from '../network';
import { isWeb3Provider } from './web3provider';

async function getMetaMaskProvider(): Promise<Web3Provider> {
  const provider = await withCheckoutError<ExternalProvider | null>(
    async () => await detectEthereumProvider(),
    { type: CheckoutErrorType.METAMASK_PROVIDER_ERROR },
  );

  if (!provider || !provider.request) {
    throw new CheckoutError(
      'No MetaMask provider installed.',
      CheckoutErrorType.METAMASK_PROVIDER_ERROR,
    );
  }

  return new Web3Provider(provider);
}

export async function createProvider(
  config: CheckoutConfiguration,
  defaultProvider: DefaultProviders,
): Promise<Web3Provider> {
  let web3Provider: Web3Provider | null = null;
  switch (defaultProvider) {
    case DefaultProviders.METAMASK: {
      web3Provider = await getMetaMaskProvider();
      break;
    }
    default:
      throw new CheckoutError(
        'Provider not supported',
        CheckoutErrorType.DEFAULT_PROVIDER_ERROR,
      );
  }
  return web3Provider;
}

export async function cloneProviders(
  config: CheckoutConfiguration,
  genericProvider: GenericProvider,
): Promise<{ providers: Providers; networkInfo: NetworkInfo }> {
  const clonedProviders: Providers = {};

  const { web3Provider } = genericProvider;

  if (!isWeb3Provider(web3Provider)) {
    throw new CheckoutError(
      'The parsed provider is not a Web3Provider',
      CheckoutErrorType.PROVIDER_ERROR,
    );
  }

  if (!genericProvider?.name) {
    throw new CheckoutError(
      'The provider name is not defined',
      CheckoutErrorType.PROVIDER_ERROR,
    );
  }

  const providerName: string = genericProvider.name;

  const allowedNetworks = await getNetworkAllowList(config, {
    type: NetworkFilterTypes.ALL,
  });

  for (const network of allowedNetworks.networks) {
    const chainId: ChainId = network.chainId as ChainId;
    const newProvider: Web3Provider = new Web3Provider(
      web3Provider.provider,
      chainId,
    );

    if (!clonedProviders[providerName]) {
      clonedProviders[providerName] = {
        [chainId]: newProvider,
      } as ProviderForChain;
    } else {
      clonedProviders[providerName][chainId] = newProvider;
    }
  }

  const networkInfo: NetworkInfo = await getNetworkInfo(config, web3Provider);

  return {
    providers: clonedProviders,
    networkInfo,
  };
}
