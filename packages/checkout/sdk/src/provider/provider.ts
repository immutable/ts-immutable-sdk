/* eslint-disable @typescript-eslint/no-explicit-any */
import detectEthereumProvider from '@metamask/detect-provider';
import { Web3Provider, ExternalProvider } from '@ethersproject/providers';
import {
  ChainId,
  DefaultProviders,
  GenericProvider,
  GetNetworkAllowListParams,
  NetworkFilterTypes,
  ProviderForChain,
  Providers,
} from '../types';
import { CheckoutError, CheckoutErrorType, withCheckoutError } from '../errors';
import { CheckoutConfiguration } from '../config';
import { getNetworkAllowList } from '../network';

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

export async function setProvider(
  config: CheckoutConfiguration,
  genericProvider: GenericProvider,
): Promise<{ providers: Providers; currentChainId: number | undefined }> {
  const clonedProviders: Providers = {};

  const getNetParams: GetNetworkAllowListParams = {
    type: NetworkFilterTypes.ALL,
  };

  const allowedNetworks = await getNetworkAllowList(config, getNetParams);

  for (const network of allowedNetworks.networks) {
    const chainId: ChainId = network.chainId as ChainId;
    const newProvider: Web3Provider = new Web3Provider(
      genericProvider.web3Provider!.provider,
      chainId,
    );

    if (!clonedProviders[genericProvider.name]) {
      clonedProviders[genericProvider.name] = {
        [chainId]: newProvider,
      } as ProviderForChain;
    } else {
      clonedProviders[genericProvider.name][chainId] = newProvider;
    }
  }

  const currentNetwork = await genericProvider.web3Provider?.getNetwork();

  return {
    providers: clonedProviders,
    currentChainId: currentNetwork?.chainId as ChainId,
  };
}
