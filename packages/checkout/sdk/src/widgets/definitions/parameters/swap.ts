import { WalletProviderName } from '../../../types';
import { WidgetLanguage } from '../configurations';

export enum SwapDirection {
  FROM = 'FROM',
  TO = 'TO',
}

/**
 * Swap Widget parameters
 * @property {string | undefined} amount
 * @property {string | undefined} fromTokenAddress
 * @property {string | undefined} toTokenAddress
 * @property {WalletProviderName | undefined} walletProviderName
 */
export type SwapWidgetParams = {
  /** The formatted amount to swap, used to populate the swap from amount field */
  amount?: string;
  /** The contract address of the token to swap from */
  fromTokenAddress?: string;
  /** The contract address of the token to swap to */
  toTokenAddress?: string;
  /** The wallet provider name to use for the swap widget */
  walletProviderName?: WalletProviderName;
  /** The language to use for the swap widget */
  language?: WidgetLanguage;
  /** Whether the swap widget should display the form or automatically proceed with the swap */
  autoProceed?: boolean;
  /** The direction of the swap */
  direction?: SwapDirection;
  /** Whether to show a back button on the first screen, on click triggers REQUEST_GO_BACK event */
  showBackButton?: boolean;
};
