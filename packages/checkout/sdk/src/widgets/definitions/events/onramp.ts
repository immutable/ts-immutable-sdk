/**
 * Enum of possible OnRamp Widget event types.
 */
export enum OnRampEventType {
  CLOSE_WIDGET = 'close-widget',
  SUCCESS = 'success',
  FAILURE = 'failure',
  LANGUAGE_CHANGED = 'language-changed',
}

/**
 * Represents a successful on-ramp transaction.
 * @property {string} transactionHash
 */
export type OnRampSuccess = {
  /** The transaction hash of the successful transaction. */
  transactionHash: string;
};

/**
 * Type representing a On-ramp Widget with type FAILURE.
 * @property {string} reason
 * @property {number} timestamp
 */
export type OnRampFailed = {
  /** The reason why the on-ramp failed. */
  reason: string;
  /** The timestamp of the failed transaction. */
  timestamp: number;
};
