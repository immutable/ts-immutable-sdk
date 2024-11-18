/* eslint-disable @typescript-eslint/no-explicit-any */
import detectEthereumProvider from '@metamask/detect-provider';
import { Passport } from '@imtbl/passport';
import { Eip1193Provider } from 'ethers';
import {
  EIP6963ProviderDetail,
  NamedBrowserProvider,
  WalletProviderName,
} from '../types';
import { CheckoutError, CheckoutErrorType, withCheckoutError } from '../errors';
import { InjectedProvidersManager } from './injectedProvidersManager';
import { metaMaskProviderInfo, passportProviderInfo } from './providerDetail';

async function getMetaMaskProvider(): Promise<NamedBrowserProvider> {
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

  return new NamedBrowserProvider(WalletProviderName.METAMASK, provider);
}

export async function createProvider(
  walletProviderName: WalletProviderName,
  passport?: Passport,
): Promise<NamedBrowserProvider> {
  let browserProvider: NamedBrowserProvider | null = null;
  let providerDetail: EIP6963ProviderDetail | undefined;
  switch (walletProviderName) {
    case WalletProviderName.PASSPORT: {
      providerDetail = InjectedProvidersManager.getInstance().findProvider({ rdns: passportProviderInfo.rdns });
      if (!providerDetail) {
        if (passport) {
          browserProvider = new NamedBrowserProvider(
            WalletProviderName.PASSPORT,
            await passport.connectEvm({ announceProvider: false }),
          );
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
        browserProvider = await getMetaMaskProvider();
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

  if (!browserProvider && providerDetail) {
    browserProvider = new NamedBrowserProvider(
      providerDetail.info.name as WalletProviderName,
      providerDetail.provider,
    );
  }

  if (!browserProvider) {
    // eslint-disable-next-line no-console
    console.error('Failed to create provider');
    throw new CheckoutError(
      'Failed to create provider',
      CheckoutErrorType.DEFAULT_PROVIDER_ERROR,
    );
  }

  return browserProvider;
}
