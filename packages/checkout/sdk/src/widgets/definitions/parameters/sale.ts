import { Web3Provider } from '@ethersproject/providers';
import { WalletProviderName } from '../../../types';

/**
 * Sale Widget parameters
 * @property {WalletProviderName | undefined} walletProvider - The wallet provider to use for the onramp widget
 * @property {Web3Provider | undefined} web3Provider - The ethers Web3Provider
 */
export interface SaleWidgetParams {
  walletProvider?: WalletProviderName;
  web3Provider?: Web3Provider
}
