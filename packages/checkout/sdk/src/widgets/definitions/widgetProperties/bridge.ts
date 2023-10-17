import { WalletProviderName } from '../../../types';

export type BridgeWidgetProps = {
  fromContractAddress?: string;
  amount?: string;
  walletProvider?: WalletProviderName
};
