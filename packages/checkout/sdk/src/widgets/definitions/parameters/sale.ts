import { WalletProviderName } from '../../../types';

// Fixme: In SaleWidgetParams pass environmentId through from sdk when it is sorted with hub

/**
 * Sale Widget parameters
 * @property {string} amount
 * @property {string} environmentId
 * @property {string} fromTokenAddress
 * @property {SaleItem[]} items
 * @property {WalletProviderName | undefined} walletProviderName
 */
export type SaleWidgetParams = {
  /** The total price to pay for the items in the sale */
  amount?: string;
  environmentId?: string;
  fromTokenAddress?: string;
  /** The list of products to be purchased */
  items?: SaleItem[];
  /** The wallet provider name to default to if no web3Provider is passed */
  walletProviderName?: WalletProviderName;
};

/**
 * A product to be purchased
 * @property {string} productId
 * @property {number} qty
 * @property {string} name
 * @property {string} image
 * @property {string} description
 */
export type SaleItem = {
  /** The id of the product */
  productId: string;
  /** The quantity to be purchased */
  qty: number;
  /** The name of the item */
  name: string;
  /** The image url of the item */
  image: string;
  /** The description of the item */
  description: string;
};
