import { Web3Provider } from '@ethersproject/providers';
import { WalletProviderName, CheckoutErrorType, Checkout } from '@imtbl/checkout-sdk';

export function isPassportProvider(provider?: Web3Provider | null) {
  return (provider?.provider as any)?.isPassport === true;
}

export function isMetaMaskProvider(provider?: Web3Provider | null) {
  return provider?.provider?.isMetaMask === true;
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
        requestWalletPermissions: changeAccount,
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
