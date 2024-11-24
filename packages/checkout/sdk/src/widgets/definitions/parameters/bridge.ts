/* eslint-disable max-len */
import { WalletProviderName } from '../../../types';
import { WidgetLanguage } from '../configurations';

/**
 * Bridge Widget parameters
 * @property {string | undefined} tokenAddress
 * @property {string | undefined} amount
 * @property {WalletProviderName | undefined} walletProviderName
 */
export type BridgeWidgetParams = {
  /** The contract address of the token to bridge from, used to populate the bridge form token field */
  tokenAddress?: string;
  /** The formatted amount to bridge, used to populate the bridge form amount field */
  amount?: string;
  /** The wallet provider name to use for the bridge widget */
  walletProviderName?: WalletProviderName;
  /** The language to use for the bridge widget */
  language?: WidgetLanguage;
  /** Whether to show a back button on the first screen, on click triggers REQUEST_GO_BACK event */
  showBackButton?: boolean;
};
