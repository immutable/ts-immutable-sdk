/**
 * The different types of errors that can be returned by the checkout process.
 */
export enum CheckoutErrorType {
  PROVIDER_PREFERENCE_ERROR = 'PROVIDER_PREFERENCE_ERROR',
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
}

/**
 * The type signature for an error.
 * Contains a type that corresponds to a {@link CheckoutErrorType}, an optional message string and optional data object.
 */
export type ErrorType = {
  type: CheckoutErrorType;
  message?: string;
  data?: { [key: string]: string };
};

/**
 * The Checkout error class that extends the Error class.
 * Contains a message string, a type that corresponds to a {@link CheckoutErrorType} and optional data object.
 * It has a constructor that takes in a message string, a type and an optional data object.
 */
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

/**
 * The different types of internal errors that can be returned by the checkout process.
 */
export enum CheckoutInternalErrorType {
  REJECTED_SWITCH_AFTER_ADDING_NETWORK = 'REJECTED_SWITCH_AFTER_ADDING_NETWORK',
}

/**
 * The Checkout internal error class that extends the Error class.
 * Contains a type that corresponds to a {@link CheckoutInternalErrorType}.
 * It has a constructor that takes in a type that corresponds to a {@link CheckoutInternalErrorType}.
 */
export class CheckoutInternalError extends Error {
  public type: CheckoutInternalErrorType;

  constructor(type: CheckoutInternalErrorType) {
    super('Checkout internal error');
    this.type = type;
  }
}

/**
 * Higher order function that takes in a function and an error object.
 * Returns the result of the function or throws a custom {@link CheckoutError}.
 * If the error thrown by the function is an instance of {@link CheckoutError},
 * it throws a new {@link CheckoutError} based on the custom error object.
 * Otherwise, it throws a new {@link CheckoutError} based on the custom error object with the cause of the error appended to the message.
 * @throws {@link CheckoutError}
 */
export const withCheckoutError = async <T>(
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
