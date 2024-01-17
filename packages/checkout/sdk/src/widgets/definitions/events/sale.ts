/**
 * Enum representing possible Sale Widget event types.
 */
export enum SaleEventType {
  CLOSE_WIDGET = 'close-widget',
  SUCCESS = 'success',
  FAILURE = 'failure',
  REJECTED = 'rejected',
  TRANSACTION_SUCCESS = 'transaction-success',
  LANGUAGE_CHANGED = 'language-changed',
  PAYMENT_METHOD = 'payment-method',
}

/**
 * Represents a successful Sale transaction.
 * @property {Array} transactions -
 */
export type SaleSuccess = {
  /** Chosen payment method */
  paymentMethod: string | undefined;
  /** The executed transactions */
  transactions: {
    method: string;
    hash: string | undefined;
  }[];
  [key: string]: unknown;
};

/**
 * Type representing a Sale Widget with type FAILURE.
 * @property {string} reason
 * @property {number} timestamp
 * @property {Array} transactions
 */
export type SaleFailed = {
  /** The reason why the swap failed. */
  reason: string;
  /** The timestamp of the failed swap. */
  timestamp: number;
  /** Chosen payment method */
  paymentMethod: string | undefined;
  /** The executed transactions */
  transactions: {
    method: string;
    hash: string | undefined;
  }[];
};

/**
 * Type representing a Sale Widget with type TRANSACTION_SUCCESS.
 * @property {Object} transactions
 */
export type SaleTransactionSuccess = {
  /** The executed transactions */
  transactions: {
    method: string;
    hash: string | undefined;
  }[];
};

/**
 * Type representing a Sale Widget with type PAYMENT_METHOD.
 * @property {Object} transactions
 */
export type SalePaymentMethod = {
  /** Chosen payment method */
  paymentMethod: string | undefined;
};
