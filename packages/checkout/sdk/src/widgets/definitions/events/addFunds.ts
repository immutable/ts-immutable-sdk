/**
 * Enum of possible Add Funds Widget event types.
 */
export enum AddFundsEventType {
  CLOSE_WIDGET = 'close-widget',
  LANGUAGE_CHANGED = 'language-changed',
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
  /** The reason why the on-ramp failed. */
  reason: string;
  /** The timestamp of the failed transaction. */
  timestamp: number;
};
