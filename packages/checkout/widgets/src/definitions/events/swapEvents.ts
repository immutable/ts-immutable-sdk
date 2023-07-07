/**
 * Enum representing possible Swap Widget event types.
 */
export enum SwapEventType {
  CLOSE_WIDGET = 'close-widget',
  SUCCESS = 'success',
  FAILURE = 'failure',
  REJECTED = 'rejected',
}

/**
 * Represents a successful swap transaction.
 * @property {string} transactionHash - The hash of the successful transaction.
 */
export type SwapSuccess = {
  transactionHash: string;
};

/**
 * Type representing a Swap Widget with type FAILURE.
 * @property {string} reason - The reason why the swap failed.
 * @property {number} timestamp - The timestamp of the failed swap.
 */
export type SwapFailed = {
  reason: string;
  timestamp: number;
};

/**
 * Type representing a Swap Widget with type FAILURE.
 * @property {string} reason - The reason why the swap failed.
 * @property {number} timestamp - The timestamp of the failed swap.
 */
export type SwapRejected = {
  reason: string;
  timestamp: number;
};
