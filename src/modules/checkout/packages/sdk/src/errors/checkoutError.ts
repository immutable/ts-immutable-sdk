export enum CheckoutErrorType {
  GET_BALANCE_ERROR = 'GET_BALANCE_ERROR',
  GET_ERC20_BALANCE_ERROR = 'GET_ERC20_BALANCE_ERROR'
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
      customError.message ||
      `${(error as Error).message}` ||
      'UnknownError';
    throw new CheckoutError(errorMessage, customError.type);
  }
}
