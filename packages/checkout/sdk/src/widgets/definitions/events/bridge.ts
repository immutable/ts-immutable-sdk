/**
 * Enum of possible Bridge Widget event types.
 */
export enum BridgeEventType {
  CLOSE_WIDGET = 'close-widget',
  FAILURE = 'failure',
  TRANSACTION_SENT = 'transaction-sent',
  LANGUAGE_CHANGED = 'language-changed',
}

/**
 * Represents a successful bridge transaction.
 * @property {string} transactionHash
 */
export type BridgeTransactionSent = {
  /** The hash of the successful transaction. */
  transactionHash: string;
};

/**
 * Represents a failed bridge transaction.
 * @property {string} reason
 * @property {number} timestamp
 */
export type BridgeFailed = {
  /** The reason for the failed transaction. */
  reason: string;
  /** The timestamp of the failed transaction. */
  timestamp: number;
};
