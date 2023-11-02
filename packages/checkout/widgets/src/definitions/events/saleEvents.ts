/**
 * Enum representing possible Sale Widget event types.
 */
export enum SaleEventType {
  CLOSE_WIDGET = 'close-widget',
  SUCCESS = 'success',
  FAILURE = 'failure',
  REJECTED = 'rejected',
  TRANSACTION_SUCCESS = 'transaction-success',
}

/**
 * Represents a successful Sale transaction.
 * @property {Array} transactions - The executed transactions
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
 * @property {Array} transactions - The executed transactions
 */
export type SaleFailed = {
  reason: string;
  timestamp: number;
  transactions: {
    method: string;
    hash: string | undefined;
  }[];
};

/**
 * Type representing a Sale Widget with type TRANSACTION_SUCCESS.
 * @property {Object} transactions - The executed transactions
 */
export type SaleTransactionSuccess = {
  transactions: {
    method: string;
    hash: string | undefined;
  }[];
};
