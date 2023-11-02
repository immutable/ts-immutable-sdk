import { Web3Provider } from '@ethersproject/providers';
import { WalletProviderName } from '../../../types';

/**
 * Sale Widget parameters
 * @property {string} amount - The total price to pay for the items in the sale
 * @property {SaleItem[]} items - The list of products to be purchased
 * @property {WalletProviderName | undefined} walletProvider - The wallet provider to default to if no web3Provider is passed
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

export type SaleItem = {
  productId: string;
  qty: number;
  name: string;
  image: string;
  description: string;
};
