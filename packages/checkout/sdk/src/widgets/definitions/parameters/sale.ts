import { WalletProviderName } from '../../../types';
import { WidgetLanguage } from '../configurations';
import { SalePaymentTypes } from '../events/sale';

// Fixme: In SaleWidgetParams pass environmentId through from sdk when it is sorted with hub

/**
 * Sale Widget parameters
 * @property {string} amount
 * @property {string} environmentId
 * @property {SaleItem[]} items
 * @property {WalletProviderName | undefined} walletProviderName
 */
export type SaleWidgetParams = {
  /** The total price to pay for the items in the sale */
  amount?: string;
  /** Environment id from Immutable Hub */
  environmentId?: string;
  /** The list of products to be purchased */
  items?: SaleItem[];
  /** The name of the NFT collection on sale */
  collectionName?: string;
  /** The wallet provider name to default to if no web3Provider is passed */
  walletProviderName?: WalletProviderName;
  /** The language to use for the sales widget */
  language?: WidgetLanguage;
  /** The disabled payment types */
  excludePaymentTypes?: SalePaymentTypes[];
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
