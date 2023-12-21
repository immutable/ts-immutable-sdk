import { WalletProviderName } from '../../../types';
import { WidgetLanguage } from '../configurations';

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
};
