import { Web3Provider } from '@ethersproject/providers';
import { WalletProviderName } from '@imtbl/checkout-sdk';

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
 * @typedef {Object} ConnectionSuccess
 * @property {Web3Provider} provider - The connected Web3 provider.
 * @property {WalletProviderName | undefined} walletProvider - The name of the wallet provider, if available.
 */
export type ConnectionSuccess = {
  provider: Web3Provider;
  walletProvider: WalletProviderName | undefined;
};

/**
 * Represents a connection failure with a reason.
 * @typedef {Object} ConnectionFailed
 * @property {string} reason - The reason for the failed connection.
 */
export type ConnectionFailed = {
  reason: string;
};
