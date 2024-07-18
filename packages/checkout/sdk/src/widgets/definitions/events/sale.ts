import { TokenInfo } from '../../../types';

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
  REQUEST_BRIDGE = 'request-bridge',
  REQUEST_ONRAMP = 'request-onramp',
  REQUEST_SWAP = 'request-swap',
  PAYMENT_TOKEN = 'payment-token',
}

/**
 * Represents a successful Sale transaction.
 * @property {Array} transactions -
 */
export type SaleSuccess = {
  /** Chosen payment method */
  paymentMethod: SalePaymentTypes | undefined;
  /** The minted items token ids  */
  tokenIds: string[];
  /** The executed transactions */
  transactions: {
    method: string;
    hash: string | undefined;
  }[];
  /** The order reference id, use it to trace order throughout flow */
  transactionId: string;
  [key: string]: unknown;
};

/**
 * Type representing a Sale Widget with type FAILURE.
 * @property {string} reason
 * @property {number} timestamp
 * @property {Array} transactions
 */
export type SaleFailed = {
  /** The reason why sale transaction failed. */
  reason: string;
  /** The error object. */
  error: Record<string, unknown>;
  /** The timestamp of the failed swap. */
  timestamp: number;
  /** Chosen payment method */
  paymentMethod: SalePaymentTypes | undefined;
  /** The executed transactions */
  transactions: {
    method: string;
    hash: string | undefined;
  }[];
  /** The order reference id, use it to trace order throughout flow */
  transactionId: string;
};

/**
 * Type representing a Sale Widget with type TRANSACTION_SUCCESS.
 * @property {Object} transactions
 */
export type SaleTransactionSuccess = {
  paymentMethod: SalePaymentTypes | undefined;
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
  paymentMethod: SalePaymentTypes | undefined;
};

/**
 * Type representing a Sale Widget with type PAYMENT_TOKEN.
 * @property {Object} transactions
 */
export type SalePaymentToken = {
  /** Chosen payment token */
  settlementType: string;
  type: string;
  token: TokenInfo;
  amount: string;
  balance: string;
  fiat: {
    amount: string;
    balance: string;
    symbol: string;
  }
};

/**
 * Enum representing Sale Widget available payment types.
 */
export enum SalePaymentTypes {
  CRYPTO = 'crypto',
  DEBIT = 'debit',
  CREDIT = 'credit',
}
