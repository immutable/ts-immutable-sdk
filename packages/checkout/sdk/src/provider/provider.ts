/* eslint-disable @typescript-eslint/no-explicit-any */
import detectEthereumProvider from '@metamask/detect-provider';
import { Web3Provider, ExternalProvider } from '@ethersproject/providers';
import {
  ChainId,
  DefaultProviders,
  GenericProvider,
  Providers,
} from '../types';
import { CheckoutError, CheckoutErrorType, withCheckoutError } from '../errors';
import { CheckoutConfiguration } from '../config';

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
  providers: Array<GenericProvider>,
): Promise<Providers> {
  const clonedProviders: Providers = {};

  for (const genericProvider of providers) {
    clonedProviders[genericProvider.name][ChainId.ETHEREUM] = genericProvider.web3Provider!;
  }

  return clonedProviders;
}
