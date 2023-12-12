import { WalletProviderName } from '../../../types';
/**
 * OnRamp Widget parameters
 * @property {string | undefined} tokenAddress
 * @property {string | undefined} amount
 * @property {WalletProviderName | undefined} walletProviderName
 */
export type OnRampWidgetParams = {
  /** The contract address of the token to onramp */
  tokenAddress?: string;
  /** The formatted amount to onramp, used to populate the onramp form amount field */
  amount?: string;
  /** The wallet provider name to use for the onramp widget */
  walletProviderName?: WalletProviderName;
  language?: 'en' | 'ja';
};
