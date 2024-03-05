import { Checkout, CheckoutErrorType, WalletProviderName } from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';

export async function connectToProvider(
  checkout: Checkout,
  provider: Web3Provider,
  changeAccount?: boolean,
): Promise<Web3Provider> {
  let connected = false;
  let web3Provider: Web3Provider = provider;
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
      web3Provider = connectedProvider;
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

  return web3Provider;
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

  return await connectToProvider(checkout, provider, changeAccount);
}
