import { ConnectionProviders } from './connect';

export const WALLET_ACTION = {
  CHECK_CONNECTION: 'eth_accounts',
  CONNECT: 'eth_requestAccounts',
  ADD_NETWORK: 'wallet_addEthereumChain',
  SWITCH_NETWORK: 'wallet_switchEthereumChain',
};

export enum WalletFilterTypes {
  ALL = 'all',
  DESKTOP = 'desktop',
  MOBILE = 'mobile',
}

export interface WalletFilter {
  connectionProvider: ConnectionProviders;
}

export interface GetWalletAllowListParams {
  type: WalletFilterTypes;
  exclude?: WalletFilter[];
}

export interface WalletInfo {
  connectionProvider: ConnectionProviders;
  name: string;
  description: string;
  icon: string;
}

export interface GetWalletAllowListResult {
  wallets: WalletInfo[];
}
