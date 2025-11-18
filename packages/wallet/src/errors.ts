export enum WalletErrorType {
  WALLET_CONNECTION_ERROR = 'WALLET_CONNECTION_ERROR',
  TRANSACTION_REJECTED = 'TRANSACTION_REJECTED',
  INVALID_CONFIGURATION = 'INVALID_CONFIGURATION',
  UNAUTHORIZED = 'UNAUTHORIZED',
  GUARDIAN_ERROR = 'GUARDIAN_ERROR',
  SERVICE_UNAVAILABLE_ERROR = 'SERVICE_UNAVAILABLE_ERROR',
  NOT_LOGGED_IN_ERROR = 'NOT_LOGGED_IN_ERROR',
}

export class WalletError extends Error {
  readonly type: WalletErrorType;

  constructor(message: string, type: WalletErrorType) {
    super(message);
    this.name = 'WalletError';
    this.type = type;
  }
}

export async function withWalletError<T>(
  fn: () => Promise<T>,
  defaultErrorType: WalletErrorType,
): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    if (err instanceof WalletError) {
      throw err;
    }
    throw new WalletError(err?.message ?? 'Unknown error', defaultErrorType);
  }
}

