export enum ProviderErrorType {
  PROVIDER_CONNECTION_ERROR = 'PROVIDER_CONNECTION_ERROR',
  WALLET_CONNECTION_ERROR = 'WALLET_CONNECTION_ERROR'
}

type ErrorType = {
  type: ProviderErrorType;
  message?: string;
};

export class ProviderError extends Error {
  public type: ProviderErrorType;
  constructor(message: string, type: ProviderErrorType) {
    super(message);
    this.type = type;
  }
}

export const withProviderError = async <T>(
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
    throw new ProviderError(errorMessage, customError.type);
  }
}
