/**
 * Enum representing different types of errors that can occur during the checkout process.
 */
export enum CheckoutErrorType {
  WEB3_PROVIDER_ERROR = 'WEB3_PROVIDER_ERROR',
  PROVIDER_ERROR = 'PROVIDER_ERROR',
  DEFAULT_PROVIDER_ERROR = 'DEFAULT_PROVIDER_ERROR',
  CONNECT_PROVIDER_ERROR = 'CONNECT_PROVIDER_ERROR',
  GET_BALANCE_ERROR = 'GET_BALANCE_ERROR',
  GET_ERC20_BALANCE_ERROR = 'GET_ERC20_BALANCE_ERROR',
  GET_NETWORK_INFO_ERROR = 'GET_NETWORK_INFO_ERROR',
  METAMASK_PROVIDER_ERROR = 'METAMASK_PROVIDER_ERROR',
  CHAIN_NOT_SUPPORTED_ERROR = 'CHAIN_NOT_SUPPORTED_ERROR',
  PROVIDER_REQUEST_MISSING_ERROR = 'PROVIDER_REQUEST_MISSING_ERROR',
  PROVIDER_REQUEST_FAILED_ERROR = 'PROVIDER_REQUEST_FAILED_ERROR',
  USER_REJECTED_REQUEST_ERROR = 'USER_REJECTED_REQUEST_ERROR',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  UNPREDICTABLE_GAS_LIMIT = 'UNPREDICTABLE_GAS_LIMIT',
  INVALID_GAS_ESTIMATE_TYPE = 'INVALID_GAS_ESTIMATE_TYPE',
}

/**
 * Represents an error object that can occur during the checkout process.
 * @typedef {Object} ErrorType
 * @property {CheckoutErrorType} type - The type of error that occurred.
 * @property {string} [message] - An optional error message.
 * @property {Object.<string, string>} [data] - An optional object containing additional data about the error.
 */
export type ErrorType = {
  type: CheckoutErrorType;
  message?: string;
  data?: { [key: string]: string };
};

/* The CheckoutError class is a custom error class in TypeScript that includes a message, type, and
optional data object. */
export class CheckoutError extends Error {
  public message: string;

  public type: CheckoutErrorType;

  public data?: { [key: string]: string };

  constructor(
    message: string,
    type: CheckoutErrorType,
    data?: { [key: string]: string },
  ) {
    super(message);
    this.message = message;
    this.type = type;
    this.data = data;
  }
}

export enum CheckoutInternalErrorType {
  REJECTED_SWITCH_AFTER_ADDING_NETWORK = 'REJECTED_SWITCH_AFTER_ADDING_NETWORK',
}

export class CheckoutInternalError extends Error {
  public type: CheckoutInternalErrorType;

  constructor(type: CheckoutInternalErrorType) {
    super('Checkout internal error');
    this.type = type;
  }
}

export const withCheckoutError = async <T>(
/**
 * Wraps a function that returns a Promise and catches any errors that occur. If an error is caught,
 * it is wrapped in a CheckoutError and rethrown.
 */
  fn: () => Promise<T>,
  customError: ErrorType,
): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    const cause = `${(error as Error).message}` || 'UnknownError';

    const errorMessage = customError.message
      ? `[${customError.type}]:${customError.message}. Cause:${cause}`
      : `[${customError.type}] Cause:${cause}`;

    if (error instanceof CheckoutError) {
      throw new CheckoutError(errorMessage, customError.type, {
        ...customError.data,
        innerErrorType: error.type,
        ...error.data,
      });
    }
    throw new CheckoutError(errorMessage, customError.type, {
      ...customError.data,
    });
  }
};
