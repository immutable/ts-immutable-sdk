export enum CheckoutErrorType {
  CONNECT_PROVIDER_ERROR = 'CONNECT_PROVIDER_ERROR',
  GET_BALANCE_ERROR = 'GET_BALANCE_ERROR',
  GET_ERC20_BALANCE_ERROR = 'GET_ERC20_BALANCE_ERROR',
  GET_NETWORK_INFO_ERROR = 'GET_NETWORK_INFO_ERROR',
  METAMASK_PROVIDER_ERROR = 'METAMASK_PROVIDER_ERROR',
  CHAIN_NOT_SUPPORTED_ERROR = 'CHAIN_NOT_SUPPORTED_ERROR',
  PROVIDER_REQUEST_MISSING_ERROR = 'PROVIDER_REQUEST_MISSING_ERROR',
  USER_REJECTED_REQUEST_ERROR = 'USER_REJECTED_REQUEST_ERROR',
  TRANSACTION_ERROR = 'TRANSACTION_ERROR',
}

type ErrorType = {
  type: CheckoutErrorType;
  message?: string;
};

export class CheckoutError extends Error {
  public type: CheckoutErrorType;
  constructor(message: string, type: CheckoutErrorType) {
    super(message);
    this.type = type;
  }
}

export const withCheckoutError = async <T>(
  fn: () => Promise<T>,
  customError: ErrorType
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    const errorMessage =
      customError.message || `${(error as Error).message}` || 'UnknownError';
    throw new CheckoutError(errorMessage, customError.type);
  }
};
