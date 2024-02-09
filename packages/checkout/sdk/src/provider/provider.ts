/* eslint-disable @typescript-eslint/no-explicit-any */
import detectEthereumProvider from '@metamask/detect-provider';
import { Web3Provider, ExternalProvider } from '@ethersproject/providers';
import { Passport } from '@imtbl/passport';
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
  walletProviderName: WalletProviderName,
  passport?: Passport,
): Promise<CreateProviderResult> {
  let provider: Web3Provider | null = null;
  switch (walletProviderName) {
    case WalletProviderName.PASSPORT: {
      if (passport) {
        provider = new Web3Provider(passport.connectEvm());
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
      break;
    }
    case WalletProviderName.METAMASK: {
      provider = await getMetaMaskProvider();
      break;
    }
    case WalletProviderName.WALLET_CONNECT: {
      // eslint-disable-next-line max-len
      throw new CheckoutError(
        'Creating WalletConnectProvider is not supported. Please integrate with @web3modal and ethers',
        CheckoutErrorType.UNSUPPORTED_CREATE_PROVIDER_TYPE,
      );
    }
    default:
      // eslint-disable-next-line no-console
      console.error(
        'The WalletProviderName that was provided is not supported',
      );
      throw new CheckoutError(
        'Provider not supported',
        CheckoutErrorType.DEFAULT_PROVIDER_ERROR,
      );
  }
  return {
    provider,
    walletProviderName,
  };
}
