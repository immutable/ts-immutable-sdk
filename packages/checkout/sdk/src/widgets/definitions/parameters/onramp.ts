import { WalletProviderName } from '../../../types';
/**
 * OnRamp Widget parameters
 * @property {string | undefined} contractAddress
 * @property {string | undefined} amount
 * @property {WalletProviderName | undefined} walletProviderName
 */
export type OnRampWidgetParams = {
  /** The contract address of the token to onramp */
  contractAddress?: string;
  /** The formatted amount to onramp, used to populate the onramp form amount field */
  amount?: string;
  /** The wallet provider name to use for the onramp widget */
  walletProviderName?: WalletProviderName;
};
