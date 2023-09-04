/**
 * Enum of possible OnRamp Widget event types.
 */
export enum OnRampEventType {
  CLOSE_WIDGET = 'close-widget',
  SUCCESS = 'success',
  FAILURE = 'failure',
}

/**
 * Represents a successful on-ramp transaction.
 * @property {string} orderId - The transaction hash of the successful transaction.
 */
export type OnRampSuccess = {
  transactionHash: string;
};

/**
 * Type representing a On-ramp Widget with type FAILURE.
 * @property {string} reason - The reason why the on-ramp failed.
 * @property {number} timestamp - The timestamp of the failed transaction.
 */
export type OnRampFailed = {
  reason: string;
  timestamp: number;
};
