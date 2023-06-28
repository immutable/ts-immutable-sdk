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
 * Type representing a Connect Widget event with type FAILURE.
 * @property {string} reason - A description of the reason for the failed connection attempt.
 */
export type ConnectionFailed = {
  reason: string;
};
