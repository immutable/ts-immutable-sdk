import { WidgetLanguage } from '../configurations';

export type PurchaseWidgetParams = {
  /** The language to use for the Purchase widget */
  language?: WidgetLanguage;

  /** Environment id from Immutable Hub */
  environmentId?: string;

  /** Whether to show a back button on the first screen, on click triggers REQUEST_GO_BACK event */
  showBackButton?: boolean;

  /** The list of products to be purchased */
  items?: PurchaseItem[];
};

/**
 * A product to be purchased
 * @property {string} productId
 * @property {number} qty
 * @property {string} name
 * @property {string} image
 * @property {string} description
 */
export type PurchaseItem = {
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
