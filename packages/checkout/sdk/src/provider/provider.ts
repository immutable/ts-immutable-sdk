/* eslint-disable @typescript-eslint/no-explicit-any */
import detectEthereumProvider from '@metamask/detect-provider';
import { Passport } from '@imtbl/passport';
import { BrowserProvider, Eip1193Provider } from 'ethers';
import {
  CreateProviderResult, EIP6963ProviderDetail,
  WalletProviderName,
} from '../types';
import { CheckoutError, CheckoutErrorType, withCheckoutError } from '../errors';
import { InjectedProvidersManager } from './injectedProvidersManager';
import { metaMaskProviderInfo, passportProviderInfo } from './providerDetail';

async function getMetaMaskProvider(): Promise<BrowserProvider> {
  const provider = await withCheckoutError<Eip1193Provider | null>(
    async () => await detectEthereumProvider(),
    { type: CheckoutErrorType.METAMASK_PROVIDER_ERROR },
  );

  if (!provider || !provider.request) {
    throw new CheckoutError(
      'No MetaMask provider installed.',
      CheckoutErrorType.METAMASK_PROVIDER_ERROR,
    );
  }

  return new BrowserProvider(provider);
}

export async function createProvider(
  walletProviderName: WalletProviderName,
  passport?: Passport,
): Promise<CreateProviderResult> {
  let web3Provider: BrowserProvider | null = null;
  let providerDetail: EIP6963ProviderDetail | undefined;
  switch (walletProviderName) {
    case WalletProviderName.PASSPORT: {
      providerDetail = InjectedProvidersManager.getInstance().findProvider({ rdns: passportProviderInfo.rdns });
      if (!providerDetail) {
        if (passport) {
          web3Provider = new BrowserProvider(await passport.connectEvm({ announceProvider: false }));
        } else {
          // eslint-disable-next-line no-console
          console.error(
            'WalletProviderName was PASSPORT but the passport instance was not provided to the Checkout constructor',
          );
          throw new CheckoutError(
            'Passport not provided',
            CheckoutErrorType.DEFAULT_PROVIDER_ERROR,
          );
        }
      }
      break;
    }
    case WalletProviderName.METAMASK: {
      providerDetail = InjectedProvidersManager.getInstance().findProvider({ rdns: metaMaskProviderInfo.rdns });
      if (!providerDetail) {
        web3Provider = await getMetaMaskProvider();
      }
      break;
    }
    default:
      providerDetail = InjectedProvidersManager.getInstance().findProvider({ rdns: walletProviderName });
      if (!providerDetail) {
        // eslint-disable-next-line no-console
        console.error(
          'The WalletProviderName that was provided is not supported',
        );
        throw new CheckoutError(
          'Provider not supported',
          CheckoutErrorType.DEFAULT_PROVIDER_ERROR,
        );
      }
  }

  if (!web3Provider && providerDetail) {
    web3Provider = new BrowserProvider(providerDetail.provider);
  }
  return {
    provider: web3Provider as BrowserProvider,
    walletProviderName,
  };
}
