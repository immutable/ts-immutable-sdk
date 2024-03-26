/**
 * Enum representing possible Swap Widget event types.
 */
export enum SwapEventType {
  CLOSE_WIDGET = 'close-widget',
  SUCCESS = 'success',
  FAILURE = 'failure',
  REJECTED = 'rejected',
  LANGUAGE_CHANGED = 'language-changed',
}

/**
 * Represents a successful swap transaction.
 * @property {string} transactionHash
 */
export type SwapSuccess = {
  /** The hash of the successful transaction. */
  transactionHash: string;
};

/**
 * Type representing a Swap Widget with type FAILURE.
 * @property {string} reason
 * @property {number} timestamp
 */
export type SwapFailed = {
  /** The reason why the swap failed. */
  reason: string;
  /** The timestamp of the failed swap. */
  timestamp: number;
};

/**
 * Type representing a Swap Widget with type REJECTED.
 * @property {string} reason -
 * @property {number} timestamp -
 */
export type SwapRejected = {
  /** The reason why the swap failed. */
  reason: string;
  /** The timestamp of the failed swap. */
  timestamp: number;
};
