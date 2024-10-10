import { Web3Provider } from '@ethersproject/providers';
import { EIP6963ProviderInfo } from '../../../types';

/**
 * Enum of possible Add Funds Widget event types.
 */
export enum AddFundsEventType {
  CLOSE_WIDGET = 'close-widget',
  LANGUAGE_CHANGED = 'language-changed',
  CONNECT_SUCCESS = 'connect-success',
  REQUEST_BRIDGE = 'request-bridge',
  REQUEST_ONRAMP = 'request-onramp',
  REQUEST_SWAP = 'request-swap',
}

/**
 * Represents a successful add funds transaction.
 * @property {string} transactionHash
 */
export type AddFundsSuccess = {
  /** The transaction hash of the successful transaction. */
  transactionHash: string;
};

/**
 * Type representing a add funds failure
 * @property {string} reason
 * @property {number} timestamp
 */
export type AddFundsFailed = {
  /** The reason why it failed. */
  reason: string;
  /** The timestamp of the failed transaction. */
  timestamp: number;
};

/**
 * Type representing a successfull provider connection
 * @property {Web3Provider} provider
 * @property {EIP6963ProviderInfo} providerInfo
 * @property {'from' | 'to'} providerType
 */
export type AddFundsConnectSuccess = {
  provider: Web3Provider;
  providerInfo: EIP6963ProviderInfo;
  providerType: 'from' | 'to';
};
