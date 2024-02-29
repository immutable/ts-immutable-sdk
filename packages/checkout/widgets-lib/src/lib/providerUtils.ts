import { Web3Provider } from '@ethersproject/providers';
import { WalletProviderName, CheckoutErrorType, Checkout } from '@imtbl/checkout-sdk';
import { EIP6963ProviderDetail } from 'mipd/src/types';

export function isPassportProvider(provider?: Web3Provider | null) {
  return (provider?.provider as any)?.isPassport === true;
}

export function isMetaMaskProvider(provider?: Web3Provider | null) {
  return provider?.provider?.isMetaMask === true;
}

export function isWalletConnectProvider(provider?: Web3Provider | null) {
  return (provider?.provider as any)?.isWalletConnect === true;
}

export function getWalletProviderNameByProvider(web3Provider: Web3Provider, providers?: EIP6963ProviderDetail[]) {
  if (isMetaMaskProvider(web3Provider)) return WalletProviderName.METAMASK.toString();
  if (isPassportProvider(web3Provider)) return WalletProviderName.PASSPORT.toString();
  if (isWalletConnectProvider(web3Provider)) return 'walletconnect';

  if (providers) {
    // Find the matching provider in the providerDetail
    const matchedProviderDetail = providers.find((providerDetail) => providerDetail.provider === web3Provider.provider);
    if (matchedProviderDetail) {
      return matchedProviderDetail.info.name;
    }
  }

  return 'Other';
}

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
