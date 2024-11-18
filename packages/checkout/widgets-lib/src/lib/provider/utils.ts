import {
  EIP6963ProviderDetail, NamedBrowserProvider, WalletProviderName, WalletProviderRdns,
} from '@imtbl/checkout-sdk';
import { BrowserProvider } from 'ethers';

export function isPassportProvider(provider?: WalletProviderName | WalletProviderRdns) {
  return provider === WalletProviderName.PASSPORT || provider === WalletProviderRdns.PASSPORT;
}

export function isMetaMaskProvider(provider?: WalletProviderName | WalletProviderRdns) {
  return provider === WalletProviderName.METAMASK || provider === WalletProviderRdns.METAMASK;
}

export function isWalletConnectProvider(provider?: WalletProviderName | WalletProviderRdns) {
  return provider === WalletProviderName.WALLETCONNECT || provider === WalletProviderRdns.WALLETCONNECT;
}

export const getProviderDetailByProvider = (
  web3Provider: BrowserProvider,
  providers?: EIP6963ProviderDetail[],
) => providers?.find(
  (providerDetail) => providerDetail.provider === web3Provider.ethereumProvider,
);

export function getWalletProviderNameByProvider(
  browserProvider: NamedBrowserProvider | undefined,
  providers?: EIP6963ProviderDetail[],
) {
  if (isMetaMaskProvider(browserProvider?.name)) return WalletProviderName.METAMASK.toString();
  if (isPassportProvider(browserProvider?.name)) return WalletProviderName.PASSPORT.toString();
  if (isWalletConnectProvider(browserProvider?.name)) return 'walletconnect';

  if (providers && browserProvider) {
    // Find the matching provider in the providerDetail
    const matchedProviderDetail = getProviderDetailByProvider(
      browserProvider,
      providers,
    );
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

/**
 * Checks conditions to operate a gas-free flow.
 *
 * TODO:
 * - Phase 1 (2024): Allow all passport wallets to be gas-free.
 * - Phase 2 & 3 (2025): Not all passport wallets will be gas-free.
 *   Therefore, the gas-free condition must be checked against the relayer's
 *   `im_getFeeOptions` endpoint, which should return zero for
 *   passport accounts with gas sponsorship enabled.
 *
 * Refer to the docs for more details:
 * https://docs.immutable.com/docs/zkevm/architecture/gas-sponsorship-for-gamers/
 */
export function isGasFree(provider?: NamedBrowserProvider | null) {
  return isPassportProvider(provider?.name);
}
