/* eslint-disable max-len */
import { WalletProviderName } from '../../../types';

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
  language?: 'en' | 'ja';
};
