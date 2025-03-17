export enum TransferEventType {
  CLOSE_WIDGET = 'close-widget',
  CONNECT_SUCCESS = 'connect-success',
  SUCCESS = 'success',
  FAILURE = 'failure',
}

/**
 * Represents a successful transfer.
 */
export type TransferSuccess = {};

/**
 * Type representing a transfer failure
 * @property {string} reason
 */
export type TransferFailed = {
  reason: string;
  timestamp: number;
};
