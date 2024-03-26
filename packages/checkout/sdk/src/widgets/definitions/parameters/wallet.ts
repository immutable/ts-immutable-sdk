/* eslint-disable max-len */
import { WalletProviderName } from '../../../types';
import { WidgetLanguage } from '../configurations';

/**
 * Wallet Widget parameters
 * @property {WalletProviderName | undefined} walletProviderName
 */
export type WalletWidgetParams = {
  /** The wallet provider name to use for the wallet widget */
  walletProviderName?: WalletProviderName;
  /** The language to use for the wallet widget */
  language?: WidgetLanguage;
};
