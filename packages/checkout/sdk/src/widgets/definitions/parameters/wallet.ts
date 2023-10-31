/* eslint-disable max-len */
import { Web3Provider } from '@ethersproject/providers';
import { WalletProviderName } from '../../../types';

/**
 * Wallet Widget parameters
 * @property {WalletProviderName | undefined} walletProvider - The wallet provider to use for the wallet widget
 * @property {Web3Provider | undefined} web3Provider - The ethers Web3Provider
 */
export type WalletWidgetParams = {
  walletProvider?: WalletProviderName
  web3Provider?: Web3Provider
};
