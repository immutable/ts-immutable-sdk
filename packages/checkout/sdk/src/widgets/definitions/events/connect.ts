import { Web3Provider } from '@ethersproject/providers';
import { WalletProviderName } from '../../../types';

/**
 * Enum representing possible Connect Widget event types.
 */
export enum ConnectEventType {
  CLOSE_WIDGET = 'close-widget',
  SUCCESS = 'success',
  FAILURE = 'failure',
}

/**
 * Represents a successful connection.
 * @property {Web3Provider} provider
 * @property {WalletProviderName | undefined} walletProviderName
 */
export type ConnectionSuccess = {
  /** The connected provider. */
  provider: Web3Provider;
  /** The wallet provider name of the connected provider. */
  walletProviderName: WalletProviderName | undefined;
};

/**
 * Represents a connection failure with a reason.
 * @property {string} reason
 */
export type ConnectionFailed = {
  /** The reason for the failed connection. */
  reason: string;
};
