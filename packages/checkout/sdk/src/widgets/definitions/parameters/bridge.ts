/* eslint-disable max-len */
import { WalletProviderName } from '../../../types';

/**
 * Bridge Widget parameters
 * @property {string | undefined} fromContractAddress - The contract address of the token to bridge from, used to populate the bridge form token field
 * @property {string | undefined} amount - The formatted amount to bridge, used to populate the bridge form amount field
 */
export type BridgeWidgetParams = {
  fromContractAddress?: string;
  amount?: string;
  walletProvider?: WalletProviderName
};
