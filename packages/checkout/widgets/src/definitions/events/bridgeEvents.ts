/**
 * Enum of possible Bridge Widget event types.
 */
export enum BridgeEventType {
  CLOSE_WIDGET = 'close-widget',
  SUCCESS = 'success',
  FAILURE = 'failure',
}

/**
 * Represents a successful bridge transaction.
 * @property {string} transactionHash - The hash of the successful transaction.
 */
export type BridgeSuccess = {
  transactionHash: string;
};

/**
 * Represents a failed bridge transaction.
 * @property {string} reason - The reason for the failed transaction.
 * @property {number} timestamp - The timestamp of the failed transaction.
 */
export type BridgeFailed = {
  reason: string;
  timestamp: number;
};
