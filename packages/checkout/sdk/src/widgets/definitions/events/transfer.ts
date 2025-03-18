export enum TransferEventType {
  CLOSE_WIDGET = 'close-widget',
  REJECTED = 'rejected',
  SUCCESS = 'success',
  FAILURE = 'failure',
}

/**
 * Represents a successful transfer.
 */
export type TransferSuccess = {
  transactionHash: string;
};

/**
 * Type representing a transfer failure
 * @property {string} reason
 */
export type TransferFailed = {
  reason: string;
  timestamp: number;
};

/**
 * Type representing a transfer rejected
 * @property {string} reason
 */
export type TransferRejected = {
};
