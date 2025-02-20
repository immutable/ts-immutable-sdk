import { EIP6963ProviderInfo, WrappedBrowserProvider } from '../../../types';

/**
 * Enum of possible Add Tokens Widget event types.
 */
export enum AddTokensEventType {
  CLOSE_WIDGET = 'close-widget',
  LANGUAGE_CHANGED = 'language-changed',
  CONNECT_SUCCESS = 'connect-success',
  SUCCESS = 'success',
  FAILURE = 'failure',
}

/**
 * Represents a successful add tokens transaction.
 * @property {string} transactionHash
 */
export type AddTokensSuccess = {
  /** The transaction hash of the successful transaction. */
  transactionHash: string;
};

/**
 * Type representing add tokens failure
 * @property {string} reason
 * @property {number} timestamp
 */
export type AddTokensFailed = {
  /** The reason why it failed. */
  reason: string;
  /** The timestamp of the failed transaction. */
  timestamp: number;
};

/**
 * Type representing a successful provider connection
 * @property {WrappedBrowserProvider} provider
 * @property {EIP6963ProviderInfo} providerInfo
 * @property {'from' | 'to'} providerType
 */
export type AddTokensConnectSuccess = {
  provider: WrappedBrowserProvider;
  providerInfo: EIP6963ProviderInfo;
  providerType: 'from' | 'to';
};
