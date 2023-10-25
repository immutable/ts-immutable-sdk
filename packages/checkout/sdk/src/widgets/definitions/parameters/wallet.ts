/* eslint-disable max-len */
import { Web3Provider } from '@ethersproject/providers';
import { Passport } from '@imtbl/passport';
import { WalletProviderName } from '../../../types';

/**
 * Wallet Widget parameters
 * @property {WalletProviderName | undefined} walletProvider - The wallet provider to use for the wallet widget
 * @property {Web3Provider | undefined} web3Provider - The ethers Web3Provider
 * @property {Passport | undefined} passport - The passport instance
 */
export type WalletWidgetParams = {
  walletProvider?: WalletProviderName
  web3Provider?: Web3Provider
  passport?: Passport
};
