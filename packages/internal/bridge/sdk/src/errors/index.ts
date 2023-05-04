export enum BridgeErrorType {
  UNSUPPORTED_ERROR = 'UNSUPPORTED_ERROR',
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export class BridgeError extends Error {
  public type: BridgeErrorType;

  constructor(message: string, type: BridgeErrorType) {
    super(message);
    this.type = type;
  }
}

export const withBridgeError = async <T>(
  fn: () => Promise<T>,
  customErrorType: BridgeErrorType
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    const errorMessage =
      `${customErrorType}: ${(error as Error).message}` || 'UnknownError';
    throw new BridgeError(errorMessage, customErrorType);
  }
};
