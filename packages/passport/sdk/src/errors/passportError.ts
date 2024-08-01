import { isAxiosError } from 'axios';
import { imx } from '@imtbl/generated-clients';
import { trackError } from '@imtbl/metrics';

export enum PassportErrorType {
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  INVALID_CONFIGURATION = 'INVALID_CONFIGURATION',
  WALLET_CONNECTION_ERROR = 'WALLET_CONNECTION_ERROR',
  NOT_LOGGED_IN_ERROR = 'NOT_LOGGED_IN_ERROR',
  SILENT_LOGIN_ERROR = 'SILENT_LOGIN_ERROR',
  REFRESH_TOKEN_ERROR = 'REFRESH_TOKEN_ERROR',
  USER_REGISTRATION_ERROR = 'USER_REGISTRATION_ERROR',
  USER_NOT_REGISTERED_ERROR = 'USER_NOT_REGISTERED_ERROR',
  LOGOUT_ERROR = 'LOGOUT_ERROR',
  TRANSFER_ERROR = 'TRANSFER_ERROR',
  CREATE_ORDER_ERROR = 'CREATE_ORDER_ERROR',
  CANCEL_ORDER_ERROR = 'CANCEL_ORDER_ERROR',
  EXCHANGE_TRANSFER_ERROR = 'EXCHANGE_TRANSFER_ERROR',
  CREATE_TRADE_ERROR = 'CREATE_TRADE_ERROR',
  OPERATION_NOT_SUPPORTED_ERROR = 'OPERATION_NOT_SUPPORTED_ERROR',
  LINK_WALLET_ALREADY_LINKED_ERROR = 'LINK_WALLET_ALREADY_LINKED_ERROR',
  LINK_WALLET_MAX_WALLETS_LINKED_ERROR = 'LINK_WALLET_MAX_WALLETS_LINKED_ERROR',
  LINK_WALLET_VALIDATION_ERROR = 'LINK_WALLET_VALIDATION_ERROR',
  LINK_WALLET_DUPLICATE_NONCE_ERROR = 'LINK_WALLET_DUPLICATE_NONCE_ERROR',
  LINK_WALLET_GENERIC_ERROR = 'LINK_WALLET_GENERIC_ERROR',
}

export function isAPIError(error: any): error is imx.APIError {
  return 'code' in error && 'message' in error;
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
  customErrorType: PassportErrorType,
  customEventName?: string,
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    let errorMessage: string;

    if (isAxiosError(error) && error.response?.data && isAPIError(error.response.data)) {
      errorMessage = error.response.data.message;
    } else {
      errorMessage = (error as Error).message;
    }

    const passportError = new PassportError(errorMessage, customErrorType);

    if (customEventName) {
      trackError('passport', customEventName, passportError);
    }

    throw passportError;
  }
};
