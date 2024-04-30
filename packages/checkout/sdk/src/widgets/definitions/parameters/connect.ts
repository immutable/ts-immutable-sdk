import { ChainId, WalletProviderRdns } from '../../../types';
import { WidgetLanguage } from '../configurations';

export enum ConnectTargetLayer {
  LAYER1 = 'LAYER1',
  LAYER2 = 'LAYER2',
}

export type ConnectWidgetParams = {
  /** The language to use for the connect widget */
  language?: WidgetLanguage;
  /** The target chain to connect to as part of the connection process (defaults to Immutable zkEVM / Immutable zkEVM Testnet) */
  targetChainId?: ChainId;
  /** The target wallet to establish a connection with */
  targetWalletRdns?: string | WalletProviderRdns;
  /** List of wallets rdns to exclude from the connect widget */
  blocklistWalletRdns?: string[];
};
