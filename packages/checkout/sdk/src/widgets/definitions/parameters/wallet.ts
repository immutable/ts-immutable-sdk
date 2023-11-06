/* eslint-disable max-len */
import { Web3Provider } from '@ethersproject/providers';
import { WalletProviderName } from '../../../types';

/**
 * Wallet Widget parameters
 * @property {WalletProviderName | undefined} walletProviderName - The wallet provider name to use for the wallet widget
 * @property {Web3Provider | undefined} web3Provider - The ethers Web3Provider
 */
export type WalletWidgetParams = {
  walletProviderName?: WalletProviderName
  web3Provider?: Web3Provider
};
