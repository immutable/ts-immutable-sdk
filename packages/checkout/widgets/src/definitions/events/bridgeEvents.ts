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
 * @typedef {Object} BridgeSuccess
 * @property {string} transactionHash - The hash of the successful transaction.
 */
export type BridgeSuccess = {
  transactionHash: string;
};

/**
 * Represents a failed bridge connection.
 * @typedef {Object} BridgeFailed
 * @property {string} reason - The reason for the failed connection.
 * @property {number} timestamp - The timestamp of the failed connection.
 */
export type BridgeFailed = {
  reason: string;
  timestamp: number;
};
