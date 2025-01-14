import { WidgetLanguage } from '../configurations';

export type PurchaseWidgetParams = {
  /** The language to use for the Purchase widget */
  language?: WidgetLanguage;

  /** Environment id from Immutable Hub */
  environmentId?: string;

  /** Whether to show a back button on the first screen, on click triggers REQUEST_GO_BACK event */
  showBackButton?: boolean;

  /** The list of products to be purchased */
  items: PurchaseItem[];
};

export type PurchaseItem = {
  productId: string;
  qty: number;
  name: string;
  image: string;
  description: string;
};
