import { Web3Provider } from '@ethersproject/providers';
import { WalletProviderName } from '../../../types';

// TODO: Add JSDoc for Sale params once they have been finalised

/**
 * Sale Widget parameters
 * @property {WalletProviderName | undefined} walletProvider - The wallet provider to use for the onramp widget
 * @property {Web3Provider | undefined} web3Provider - The ethers Web3Provider
 */
export interface SaleWidgetParams {
  amount?: string;
  env?: string;
  environmentId?: string;
  fromContractAddress?: string;
  products?: Item[];
  walletProvider?: WalletProviderName;
  web3Provider?: Web3Provider
}

export type Item = {
  productId: string;
  qty: number;
  name: string;
  image: string;
  description: string;
};
