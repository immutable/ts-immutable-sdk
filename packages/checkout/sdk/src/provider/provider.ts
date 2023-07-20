/* eslint-disable @typescript-eslint/no-explicit-any */
import detectEthereumProvider from '@metamask/detect-provider';
import { Web3Provider, ExternalProvider } from '@ethersproject/providers';
import {
  CreateProviderResult,
  WalletProviderName,
} from '../types';
import { CheckoutError, CheckoutErrorType, withCheckoutError } from '../errors';

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
  defaultProvider: WalletProviderName,
): Promise<CreateProviderResult> {
  let provider: Web3Provider | null = null;
  let providerName: WalletProviderName;
  switch (defaultProvider) {
    case WalletProviderName.METAMASK: {
      provider = await getMetaMaskProvider();
      providerName = WalletProviderName.METAMASK;
      break;
    }
    default:
      throw new CheckoutError(
        'Provider not supported',
        CheckoutErrorType.DEFAULT_PROVIDER_ERROR,
      );
  }
  return {
    provider,
    providerName,
  };
}
