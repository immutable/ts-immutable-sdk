/**
 * Enum representing different types of errors that can occur during the checkout process.
 */
export enum CheckoutErrorType {
  MISSING_PARAMS = 'MISSING_PARAMS',
  WEB3_PROVIDER_ERROR = 'WEB3_PROVIDER_ERROR',
  PROVIDER_ERROR = 'PROVIDER_ERROR',
  DEFAULT_PROVIDER_ERROR = 'DEFAULT_PROVIDER_ERROR',
  CONNECT_PROVIDER_ERROR = 'CONNECT_PROVIDER_ERROR',
  GET_BALANCE_ERROR = 'GET_BALANCE_ERROR',
  GET_INDEXER_BALANCE_ERROR = 'GET_INDEXER_BALANCE_ERROR',
  GET_ERC20_INFO_ERROR = 'GET_ERC20_INFO_ERROR',
  GET_ERC20_BALANCE_ERROR = 'GET_ERC20_BALANCE_ERROR',
  GET_ERC721_BALANCE_ERROR = 'GET_ERC721_BALANCE_ERROR',
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
  UNSUPPORTED_TOKEN_TYPE_ERROR = 'UNSUPPORTED_TOKEN_TYPE_ERROR',
  UNSUPPORTED_BALANCE_REQUIREMENT_ERROR = 'UNSUPPORTED_BALANCE_REQUIREMENT_ERROR',
  GET_ORDER_LISTING_ERROR = 'GET_ORDER_LISTING_ERROR',
  CANCEL_ORDER_LISTING_ERROR = 'CANCEL_ORDER_LISTING_ERROR',
  PREPARE_ORDER_LISTING_ERROR = 'PREPARE_ORDER_LISTING_ERROR',
  CREATE_ORDER_LISTING_ERROR = 'CREATE_ORDER_LISTING_ERROR',
  FULFILL_ORDER_LISTING_ERROR = 'FULFILL_ORDER_LISTING_ERROR',
  SWITCH_NETWORK_UNSUPPORTED = 'SWITCH_NETWORK_UNSUPPORTED',
  GET_ERC20_ALLOWANCE_ERROR = 'GET_ERC20_ALLOWANCE_ERROR',
  GET_ERC721_ALLOWANCE_ERROR = 'GET_ERC721_ALLOWANCE_ERROR',
  GET_ERC1155_ALLOWANCE_ERROR = 'GET_ERC1155_ALLOWANCE_ERROR',
  EXECUTE_APPROVAL_TRANSACTION_ERROR = 'EXECUTE_APPROVAL_TRANSACTION_ERROR',
  EXECUTE_FULFILLMENT_TRANSACTION_ERROR = 'EXECUTE_FULFILLMENT_TRANSACTION_ERROR',
  SIGN_MESSAGE_ERROR = 'SIGN_MESSAGE_ERROR',
  BRIDGE_GAS_ESTIMATE_ERROR = 'BRIDGE_GAS_ESTIMATE_ERROR',
  ORDER_FEE_ERROR = 'ORDER_FEE_ERROR',
  ITEM_REQUIREMENTS_ERROR = 'ITEM_REQUIREMENTS_ERROR',
  API_ERROR = 'API_ERROR',
  ORDER_EXPIRED_ERROR = 'ORDER_EXPIRED_ERROR',
  WIDGETS_SCRIPT_LOAD_ERROR = 'WIDGETS_SCRIPT_LOAD_ERROR',
  APPROVAL_TRANSACTION_FAILED = 'APPROVAL_TRANSACTION_FAILED',
}

/**
 * Represents an error object with a specific type, optional message, and optional data.
 * @property {CheckoutErrorType} type
 * @property {string | undefined} [message]
 * @property {Object.<string, string> | undefined} [data]
 */
export type ErrorType = {
  /** The type of the error. */
  type: CheckoutErrorType;
  /** The error message. */
  message?: string;
  /** Additional data associated with the error. */
  data?: { [key: string]: string };
};

/* The CheckoutError class is a custom error class in TypeScript that includes a message, type, and
optional data object. */
export class CheckoutError<T = CheckoutErrorType> extends Error {
  public message: string;

  public type: T;

  public data?: { [key: string]: any };

  constructor(
    message: string,
    type: T,
    data?: {
      [key: string]: any
    },
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
    const cause = error?.error?.message ?? ((error as Error).message || 'UnknownError');

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
