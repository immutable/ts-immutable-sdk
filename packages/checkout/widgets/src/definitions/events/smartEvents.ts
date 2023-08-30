/**
 * Enum of possible Smart Widget event types.
 */
export enum SmartEventType {
  CLOSE_WIDGET = 'close-widget',
  SUCCESS = 'success',
  FAILURE = 'failure',
}

/**
 * Represents a successful smart transaction.
 * @property {string} transactionHash - The hash of the successful transaction.
 */
export type SmartSuccess = {
  transactionHash: string;
};

/**
 * Represents a failed smart transaction.
 * @property {string} reason - The reason for the failed transaction.
 * @property {number} timestamp - The timestamp of the failed transaction.
 */
export type SmartFailed = {
  reason: string;
  timestamp: number;
};
