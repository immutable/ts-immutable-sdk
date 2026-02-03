import { imx } from '@imtbl/generated-clients';

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
  SERVICE_UNAVAILABLE_ERROR = 'SERVICE_UNAVAILABLE_ERROR',
  TRANSACTION_REJECTED = 'TRANSACTION_REJECTED',
}

export function isAPIError(error: any): error is imx.APIError {
  return (
    typeof error === 'object'
    && error !== null
    && 'code' in error
    && 'message' in error
  );
}

type AxiosLikeError = {
  response?: {
    status?: number;
    data?: unknown;
  };
  config?: {
    url?: string;
    baseURL?: string;
    method?: string;
  };
};

const extractApiError = (error: unknown): imx.APIError | undefined => {
  if (isAPIError(error)) {
    return error;
  }

  if (
    typeof error === 'object'
    && error !== null
    && 'response' in error
  ) {
    const { response } = error as AxiosLikeError;
    if (response?.data && isAPIError(response.data)) {
      return response.data;
    }
  }

  return undefined;
};

const appendHttpDebugInfo = (message: string, error: unknown): string => {
  const e = error as AxiosLikeError;
  const status = e?.response?.status;
  const url = e?.config?.url;
  const baseURL = e?.config?.baseURL;
  const fullUrl = (
    typeof url === 'string' && typeof baseURL === 'string' && !/^https?:\/\//i.test(url)
      ? `${baseURL}${url}`
      : url
  );

  if (status == null && fullUrl == null) return message;
  if (message.includes('[httpStatus=')) return message;

  return `${message} [httpStatus=${status ?? 'unknown'} url=${fullUrl ?? 'unknown'}]`;
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
  customErrorType: PassportErrorType,
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    let errorMessage: string;

    if (error instanceof PassportError && error.type === PassportErrorType.SERVICE_UNAVAILABLE_ERROR) {
      throw new PassportError(error.message, error.type);
    }

    const apiError = extractApiError(error);
    if (apiError) {
      errorMessage = apiError.message;
    } else {
      errorMessage = (error as Error).message;
    }

    // Debug aid: preserve which HTTP endpoint/status failed for IMX offchain registration.
    if (customErrorType === PassportErrorType.USER_REGISTRATION_ERROR) {
      errorMessage = appendHttpDebugInfo(errorMessage, error);
    }

    throw new PassportError(errorMessage, customErrorType);
  }
};
