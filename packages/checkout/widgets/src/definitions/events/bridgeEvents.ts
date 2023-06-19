/**
 * Enum of possible Bridge Widget event types.
 */
export enum BridgeEventType {
  CLOSE_WIDGET = 'close-widget',
  SUCCESS = 'success',
  FAILURE = 'failure',
}

/**
 * Type representing a Bridge Widget event with type SUCCESS
 * @property {string} transactionHash - The transactionHash of the bridge transaction
 */
export type BridgeSuccess = {
  transactionHash: string;
};

/**
 * Type representing a Bridge Widget event with type FAILURE
 * @property {string} reason - The reason for the failure.
 * @property {number} timestamp - The UNIX timestamp (in milliseconds) when the event occurred.
 */
export type BridgeFailed = {
  reason: string;
  timestamp: number;
};
