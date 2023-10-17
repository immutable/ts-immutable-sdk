/**
 * Enum representing possible Sale Widget event types.
 */
export enum SaleEventType {
  CLOSE_WIDGET = 'close-widget',
  SUCCESS = 'success',
  FAILURE = 'failure',
  REJECTED = 'rejected',
}

/**
 * Represents a successful Sale transaction.
 * @property {string} transactionHash - The hash of the successful transaction.
 */
export type SaleSuccess = {
  transactions: {
    method: string;
    hash: string | undefined;
  }[];
  [key: string]: unknown;
};

/**
 * Type representing a Sale Widget with type FAILURE.
 * @property {string} reason - The reason why the swap failed.
 * @property {number} timestamp - The timestamp of the failed swap.
 */
export type SaleFailed = {
  reason: string;
  timestamp: number;
};
