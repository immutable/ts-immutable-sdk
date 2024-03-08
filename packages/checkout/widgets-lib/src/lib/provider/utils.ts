import { Web3Provider } from '@ethersproject/providers';
import { WalletProviderName } from '@imtbl/checkout-sdk';
import { EIP6963ProviderDetail } from './types/eip6963';

export function isPassportProvider(provider?: Web3Provider | null) {
  return (provider?.provider as any)?.isPassport === true;
}

export function isMetaMaskProvider(provider?: Web3Provider | null) {
  return provider?.provider?.isMetaMask === true;
}

export function isWalletConnectProvider(provider?: Web3Provider | null) {
  return (provider?.provider as any)?.isWalletConnect === true;
}

export function getWalletProviderNameByProvider(
  web3Provider: Web3Provider | undefined,
  providers?: EIP6963ProviderDetail[],
) {
  if (isMetaMaskProvider(web3Provider)) return WalletProviderName.METAMASK.toString();
  if (isPassportProvider(web3Provider)) return WalletProviderName.PASSPORT.toString();
  if (isWalletConnectProvider(web3Provider)) return 'walletconnect';

  if (providers && web3Provider) {
    // Find the matching provider in the providerDetail
    const matchedProviderDetail = providers.find((providerDetail) => providerDetail.provider === web3Provider.provider);
    if (matchedProviderDetail) {
      return matchedProviderDetail.info.name;
    }
  }

  return 'Other';
}

export function getProviderSlugFromRdns(rdns: string) {
  let providerSlug = '';
  switch (rdns) {
    case 'com.immutable.passport':
      providerSlug = 'passport';
      break;
    case 'io.metamask':
      providerSlug = 'metamask';
      break;
    case 'com.coinbase.wallet':
      providerSlug = 'coinbase-wallet';
      break;
    default:
      providerSlug = rdns;
  }

  return providerSlug;
}
