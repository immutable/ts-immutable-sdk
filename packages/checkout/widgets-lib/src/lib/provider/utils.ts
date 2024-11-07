import { BrowserProvider } from 'ethers';
import { EIP6963ProviderDetail, WalletProviderName } from '@imtbl/checkout-sdk';

export function isPassportProvider(provider?: BrowserProvider | null) {
  return (provider?.provider as any)?.isPassport === true;
}

export function isMetaMaskProvider(provider?: BrowserProvider | null) {
  return provider?.isMetaMask === true;
}

export function isWalletConnectProvider(provider?: BrowserProvider | null) {
  return (provider?.provider as any)?.isWalletConnect === true;
}

export const getProviderDetailByProvider = (
  web3Provider: Web3Provider,
  providers?: EIP6963ProviderDetail[],
) => providers?.find(
  (providerDetail) => providerDetail.provider === web3Provider.provider,
);

export function getWalletProviderNameByProvider(
  web3Provider: BrowserProvider | undefined,
  providers?: EIP6963ProviderDetail[],
) {
  if (isMetaMaskProvider(web3Provider)) return WalletProviderName.METAMASK.toString();
  if (isPassportProvider(web3Provider)) return WalletProviderName.PASSPORT.toString();
  if (isWalletConnectProvider(web3Provider)) return 'walletconnect';

  if (providers && web3Provider) {
    // Find the matching provider in the providerDetail
    const matchedProviderDetail = getProviderDetailByProvider(
      web3Provider,
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
export function isGasFree(provider?: BrowserProvider | null) {
  return isPassportProvider(provider);
}
