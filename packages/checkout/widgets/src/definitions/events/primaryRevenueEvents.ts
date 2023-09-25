/**
 * Enum representing possible Primary Revenue Widget event types.
 */
export enum PrimaryRevenueEventType {
  CLOSE_WIDGET = 'close-widget',
  SUCCESS = 'success',
  FAILURE = 'failure',
  REJECTED = 'rejected',
}

/**
 * Represents a successful primary revenue transaction.
 * @property {string} transactionHash - The hash of the successful transaction.
 */
export type PrimaryRevenueSuccess = {
  [key: string]: unknown;
};

/**
 * Type representing a PrimaryRevenue Widget with type FAILURE.
 * @property {string} reason - The reason why the swap failed.
 * @property {number} timestamp - The timestamp of the failed swap.
 */
export type PrimaryRevenueFailed = {
  reason: string;
  timestamp: number;
};
