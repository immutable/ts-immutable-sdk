/* eslint-disable @typescript-eslint/no-explicit-any */
import detectEthereumProvider from '@metamask/detect-provider';
import { Web3Provider, ExternalProvider } from '@ethersproject/providers';
import {
  WalletProviderName,
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
  defaultProvider: WalletProviderName,
): Promise<Web3Provider> {
  let web3Provider: Web3Provider | null = null;
  switch (defaultProvider) {
    case WalletProviderName.METAMASK: {
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
