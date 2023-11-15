import { WalletProviderName } from '../../../types';

/**
 * Swap Widget parameters
 * @property {string | undefined} amount
 * @property {string | undefined} fromContractAddress
 * @property {string | undefined} toContractAddress
 * @property {WalletProviderName | undefined} walletProviderName
 */
export type SwapWidgetParams = {
  /** The formatted amount to swap, used to populate the swap from amount field */
  amount?: string;
  /** The contract address of the token to swap from */
  fromContractAddress?: string;
  /** The contract address of the token to swap to */
  toContractAddress?: string;
  /** The wallet provider name to use for the swap widget */
  walletProviderName?: WalletProviderName;
};
