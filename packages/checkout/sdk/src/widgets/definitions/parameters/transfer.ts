import { WidgetLanguage } from '../configurations/widget';

export type TransferWidgetParams = {
  /** The language to use for the Purchase widget */
  language?: WidgetLanguage;

  /** The amount to transfer */
  amount?: string;

  /** The token address to transfer */
  tokenAddress?: `0x${string}` | 'native';

  /** The to address to transfer to */
  toAddress?: `0x${string}`;

  /** Whether to show the back button */
  showBackButton?: boolean;
};
