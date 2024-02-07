/* eslint-disable @typescript-eslint/no-explicit-any */
import detectEthereumProvider from '@metamask/detect-provider';
import { Web3Provider, ExternalProvider } from '@ethersproject/providers';
import { Passport } from '@imtbl/passport';
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5';
import { Environment } from '@imtbl/config';
import {
  CreateProviderResult,
  WalletProviderName,
} from '../types';
import { CheckoutError, CheckoutErrorType, withCheckoutError } from '../errors';
import {
  WALLET_CONNECT_ETHEREUM,
  WALLET_CONNECT_IMTBL_ZKEVM_MAINNET,
  WALLET_CONNECT_IMTBL_ZKEVM_TESTNET,
  WALLET_CONNECT_METADATA,
  WALLET_CONNECT_PROJECT_ID,
  WALLET_CONNECT_SEPOLIA,
} from '../env';
import { CheckoutConfiguration, getL1ChainId } from '../config';

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

function getWalletConnectChainsByEnvironment(environment: Environment): any[] {
  if (environment === Environment.PRODUCTION) {
    return [WALLET_CONNECT_ETHEREUM, WALLET_CONNECT_IMTBL_ZKEVM_MAINNET];
  }
  return [WALLET_CONNECT_SEPOLIA, WALLET_CONNECT_IMTBL_ZKEVM_TESTNET];
}

export async function createProvider(
  checkoutConfig: CheckoutConfiguration,
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
      const modal = createWeb3Modal({
        ethersConfig: defaultConfig({
          metadata: WALLET_CONNECT_METADATA,
          defaultChainId: getL1ChainId(checkoutConfig),
          enableEIP6963: true,
          enableInjected: true,
        }),
        chains: getWalletConnectChainsByEnvironment(checkoutConfig.environment),
        enableAnalytics: true, // Optional - true by default
        projectId: WALLET_CONNECT_PROJECT_ID,
      });

      // TODO: All of the below code for the modal open and getting provider needs proper testing

      const existingWCProvider = modal.getWalletProvider();
      if (modal.getIsConnected() && existingWCProvider) {
        provider = new Web3Provider(existingWCProvider);
      } else {
        const getProvider = () => new Promise<Web3Provider | null>((resolve, reject) => {
          modal.subscribeProvider((newState) => {
            if (newState.provider) {
              modal.close();
              resolve(new Web3Provider(newState.provider));
            }
            reject();
          });

          modal.open();
        });
        provider = await getProvider();
      }

      if (!provider) throw new Error('no provider');
      break;
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
