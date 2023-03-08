export enum PassportErrorType {
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  INVALID_CONFIGURATION = 'INVALID_CONFIGURATION',
  WALLET_CONNECTION_ERROR = 'WALLET_CONNECTION_ERROR',
  NOT_LOGGED_IN_ERROR = 'NOT_LOGGED_IN_ERROR',
  REFRESH_TOKEN_ERROR = 'REFRESH_TOKEN_ERROR',
}

type ErrorType = {
  type: PassportErrorType;
  message?: string;
};

export class PassportError extends Error {
  public type: PassportErrorType;
  constructor(message: string, type: PassportErrorType) {
    super(message);
    this.type = type;
  }
}

export const withPassportError = async <T>(
  fn: () => Promise<T>,
  customError: ErrorType
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    const errorMessage =
      customError.message ||
      `${customError.type}: ${(error as Error).message}` ||
      'UnknownError';
    throw new PassportError(errorMessage, customError.type);
  }
}
