export enum AuthErrorType {
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  LOGOUT_ERROR = 'LOGOUT_ERROR',
  USER_REGISTRATION_ERROR = 'USER_REGISTRATION_ERROR',
  WALLET_CONNECTION_ERROR = 'WALLET_CONNECTION_ERROR',
  NOT_LOGGED_IN_ERROR = 'NOT_LOGGED_IN_ERROR',
  INVALID_CONFIGURATION = 'INVALID_CONFIGURATION',
  REFRESH_TOKEN_ERROR = 'REFRESH_TOKEN_ERROR',
  DEVICE_AUTHORIZATION_ERROR = 'DEVICE_AUTHORIZATION_ERROR',
  DEVICE_AUTHORIZATION_PENDING = 'DEVICE_AUTHORIZATION_PENDING',
  SILENT_LOGIN_ERROR = 'SILENT_LOGIN_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
}

export class AuthError extends Error {
  readonly type: AuthErrorType;

  constructor(message: string, type: AuthErrorType) {
    super(message);
    this.name = 'AuthError';
    this.type = type;
  }
}

export async function withAuthError<T>(
  fn: () => Promise<T>,
  defaultErrorType: AuthErrorType,
): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    if (err instanceof AuthError) {
      throw err;
    }
    throw new AuthError(err?.message ?? 'Unknown error', defaultErrorType);
  }
}

