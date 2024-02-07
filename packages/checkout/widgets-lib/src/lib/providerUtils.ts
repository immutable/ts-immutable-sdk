import { Web3Provider } from '@ethersproject/providers';
import { WalletProviderName, CheckoutErrorType, Checkout } from '@imtbl/checkout-sdk';

export function isPassportProvider(provider?: Web3Provider | null) {
  return (provider?.provider as any)?.isPassport === true;
}

export function isMetaMaskProvider(provider?: Web3Provider | null) {
  return provider?.provider?.isMetaMask === true;
}

export function isWalletConnectProvider(provider?: Web3Provider | null) {
  return (provider?.provider as any)?.isWalletConnect === true;
}

export function getWalletProviderNameByProvider(provider?: Web3Provider) {
  if (!provider) return WalletProviderName.METAMASK;
  if (isMetaMaskProvider(provider)) return WalletProviderName.METAMASK;
  if (isPassportProvider(provider)) return WalletProviderName.PASSPORT;
  if (isWalletConnectProvider(provider)) return WalletProviderName.WALLET_CONNECT;

  return WalletProviderName.METAMASK;
}

export async function createAndConnectToProvider(
  checkout: Checkout,
  walletProviderName: WalletProviderName,
  changeAccount?: boolean,
): Promise<Web3Provider> {
  let provider: Web3Provider;
  try {
    const createResult = await checkout.createProvider({ walletProviderName });
    provider = createResult.provider;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Failed to create ${walletProviderName} provider`);
    throw error;
  }

  let connected = false;
  try {
    const { isConnected } = await checkout.checkIsWalletConnected({ provider });
    connected = isConnected;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    throw error;
  }

  if (!connected || changeAccount) {
    try {
      const { provider: connectedProvider } = await checkout.connect({
        provider,
        requestWalletPermissions: isWalletConnectProvider(provider) ? false : changeAccount,
      });
      provider = connectedProvider;
      connected = true;
    } catch (error: any) {
      if (error.type === CheckoutErrorType.USER_REJECTED_REQUEST_ERROR) {
        // eslint-disable-next-line no-console
        console.log('User rejected request');
      }
      // eslint-disable-next-line no-console
      console.error(error);
      throw error;
    }
  }

  return provider;
}
