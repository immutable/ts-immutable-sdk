/* eslint-disable max-len */
import { WalletProviderName } from '../../../types';

/**
 * Wallet Widget parameters
 * @property {WalletProviderName | undefined} walletProviderName
 */
export type WalletWidgetParams = {
  /** The wallet provider name to use for the wallet widget */
  walletProviderName?: WalletProviderName;
  language?: 'en' | 'ja';
};
