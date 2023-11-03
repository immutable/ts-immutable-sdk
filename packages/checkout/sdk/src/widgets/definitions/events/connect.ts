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
 * Represents a successful connection to a Web3 provider.
 * @property {Web3Provider} provider - The connected Web3 provider.
 * @property {WalletProviderName | undefined} walletProviderName - The name of the wallet provider
 */
export type ConnectionSuccess = {
  provider: Web3Provider;
  walletProviderName: WalletProviderName | undefined;
};

/**
 * Represents a connection failure with a reason.
 * @property {string} reason - The reason for the failed connection.
 */
export type ConnectionFailed = {
  reason: string;
};
