import { ConnectionProviders } from './connect';

/**
 * Enum representing different wallet actions.
 */
export const WALLET_ACTION = {
  CHECK_CONNECTION: 'eth_accounts',
  CONNECT: 'eth_requestAccounts',
  ADD_NETWORK: 'wallet_addEthereumChain',
  SWITCH_NETWORK: 'wallet_switchEthereumChain',
};

/**
 * Interface representing a wallet filter to be used in {@link GetWalletAllowListParams}.
 * @property {ConnectionProviders} connectionProvider - The connection provider to filter wallets by.
 */
export interface WalletFilter {
  connectionProvider: ConnectionProviders;
}

/**
 * Interface representing the parameters for {@link Checkout.getWalletsAllowList}.
 * @property {WalletFilterTypes} type - The type of wallets to filter by.
 * @property {WalletFilter[]} [exclude] - An optional list of wallet filters to exclude from the allowed wallets list.
 */
export interface GetWalletAllowListParams {
  type: WalletFilterTypes;
  exclude?: WalletFilter[];
}

/**
 * Interface representing information about a wallet used in {@link GetWalletAllowListResult}.
 * @property {ConnectionProviders} connectionProvider - The connection provider for the wallet.
 * @property {string} name - The name of the wallet.
 * @property {string} description - A description of the wallet.
 * @property {string} icon - The URL/data:image of an icon for the wallet.
 */
export interface WalletInfo {
  connectionProvider: ConnectionProviders;
  name: string;
  description: string;
  icon: string;
}

/**
 * Interface representing the result of {@link Checkout.getWalletsAllowList}.
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
  DESKTOP = 'desktop',
  MOBILE = 'mobile',
}
