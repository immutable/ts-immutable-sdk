/* eslint-disable @typescript-eslint/no-explicit-any */
import detectEthereumProvider from '@metamask/detect-provider';
import { Web3Provider, ExternalProvider } from '@ethersproject/providers';
import { Environment } from '@imtbl/config';
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
  providerUID: DefaultProviders,
): Promise<Web3Provider> {
  let web3Provider: Web3Provider | null = null;
  switch (providerUID) {
    case DefaultProviders.METAMASK: {
      web3Provider = await getMetaMaskProvider();
      break;
    }
    default:
      throw new CheckoutError(
        'Provider not supported',
        CheckoutErrorType.PROVIDER_PREFERENCE_ERROR,
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

  if (networkInfo.isSupported) {
    return {
      providers: clonedProviders,
      networkInfo,
    };
  }

  // @WT-1345 - this is throwing an error if you are not on a supported network

  let defaultNetworkInfo: NetworkInfo;
  if (config.environment === Environment.PRODUCTION) {
    defaultNetworkInfo = await getNetworkInfo(
      config,
      clonedProviders[providerName][ChainId.ETHEREUM],
    );
  } else {
    defaultNetworkInfo = await getNetworkInfo(
      config,
      clonedProviders[providerName][ChainId.SEPOLIA],
    );
  }

  return {
    providers: clonedProviders,
    networkInfo: defaultNetworkInfo,
  };
}
