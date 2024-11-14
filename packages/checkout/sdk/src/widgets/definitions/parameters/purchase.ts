import { WidgetLanguage } from '../configurations';

export type PurchaseWidgetParams = {
  /** The language to use for the Purchase widget */
  language?: WidgetLanguage;

  /** Environment id from Immutable Hub */
  environmentId?: string;

  /** The list of products to be purchased */
  items?: PurchaseItem[];
};

export type PurchaseItem = {
  productId: string;
  qty: number;
  name: string;
  image: string;
  description: string;
};
