import { Web3Provider } from '@ethersproject/providers';
import { WalletProviderName } from '../../../types';

/**
 * Sale Widget parameters
 * @property {string} amount -
 * @property {string} environmentId -
 * @property {SaleItem[]} items -
 * @property {WalletProviderName | undefined} walletProvider - The wallet provider to use for the sale widget
 * @property {Web3Provider | undefined} web3Provider - The ethers Web3Provider
 */
export interface SaleWidgetParams {
  amount?: string;
  // Fixme: pass environmentId through from sdk when it is sorted with hub
  environmentId?: string;
  fromContractAddress?: string;
  items?: SaleItem[];
  walletProvider?: WalletProviderName;
  web3Provider?: Web3Provider
}

/**
 * SaleItem describes the items to be purchased
 * @property {string} productId -
 * @property {number} qty -
 * @property {string} name -
 * @property {string} image -
 * @property {string} description -
 */
export type SaleItem = {
  productId: string;
  qty: number;
  name: string;
  image: string;
  description: string;
};
