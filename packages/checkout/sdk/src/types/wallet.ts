import { WalletProviderName } from './provider';

export enum WalletAction {
  CHECK_CONNECTION = 'eth_accounts',
  CONNECT = 'eth_requestAccounts',
  ADD_NETWORK = 'wallet_addEthereumChain',
  SWITCH_NETWORK = 'wallet_switchEthereumChain',
  GET_CHAINID = 'eth_chainId',
  REQUEST_PERMISSIONS = 'wallet_requestPermissions',
}

/**
 * Interface representing a wallet filter to be used in {@link GetWalletAllowListParams}.
 * @property {WalletProviderName} walletProviderName - The wallet provider name to filter wallets by.
 */
export interface WalletFilter {
  walletProviderName: WalletProviderName;
}

/**
 * Interface representing the parameters for {@link Checkout.getWalletAllowList}.
 * @property {WalletFilterTypes} type - The type of wallets to filter by.
 * @property {WalletFilter[]} [exclude] - An optional list of wallet filters to exclude from the allowed wallets list.
 */
export interface GetWalletAllowListParams {
  type: WalletFilterTypes;
  exclude?: WalletFilter[];
}

/**
 * Interface representing information about a wallet used in {@link GetWalletAllowListResult}.
 * @property {WalletProviderName} walletProviderName - The wallet provider name for the wallet.
 * @property {string | undefined} description - A description of the wallet.
 * @property {string | undefined} icon - The URL/data:image of an icon for the wallet.
 */
export interface WalletInfo {
  walletProviderName: WalletProviderName;
  description?: string;
  icon?: string;
}

/**
 * Interface representing the result of {@link Checkout.getWalletAllowList}.
 * @property {WalletInfo[]} wallets - A list of {@link WalletInfo} objects representing the allowed wallets.
 */
export interface GetWalletAllowListResult {
  wallets: WalletInfo[];
}

/**
 * Enum representing the platform filters used in {@link GetWalletAllowListParams}.
 */
export enum WalletFilterTypes {
  ALL = 'all',
}
