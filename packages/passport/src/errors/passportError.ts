export enum PassportErrorType {
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  INVALID_CONFIGURATION = 'INVALID_CONFIGURATION',
  WALLET_CONNECTION_ERROR = 'WALLET_CONNECTION_ERROR',
  NOT_LOGGED_IN_ERROR = 'NOT_LOGGED_IN_ERROR',
  SILENT_LOGIN_ERROR = 'SILENT_LOGIN_ERROR',
  REFRESH_TOKEN_ERROR = 'REFRESH_TOKEN_ERROR',
  USER_REGISTRATION_ERROR = 'USER_REGISTRATION_ERROR',
  LOGOUT_ERROR = 'LOGOUT_ERROR',
  TRANSFER_ERROR = 'TRANSFER_ERROR',
  CREATE_ORDER_ERROR = 'CREATE_ORDER_ERROR',
  CANCEL_ORDER_ERROR = 'CANCEL_ORDER_ERROR',
  EXCHANGE_TRANSFER_ERROR = 'EXCHANGE_TRANSFER_ERROR',
  CREATE_TRADE_ERROR = 'CREATE_TRADE_ERROR',
  OPERATION_NOT_SUPPORTED_ERROR = 'OPERATION_NOT_SUPPORTED_ERROR',
}

export class PassportError extends Error {
  public type: PassportErrorType;

  constructor(message: string, type: PassportErrorType) {
    super(message);
    this.type = type;
  }
}

export const withPassportError = async <T>(
  fn: () => Promise<T>,
  customErrorType: PassportErrorType
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    const errorMessage =
      `${customErrorType}: ${(error as Error).message}` || 'UnknownError';
    throw new PassportError(errorMessage, customErrorType);
  }
};
