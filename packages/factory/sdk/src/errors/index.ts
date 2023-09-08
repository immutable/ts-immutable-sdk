/**
 * @enum {string} FactoryErrorType - Enumeration of different types of factory errors.
 */
export enum FactoryErrorType {
  UNSUPPORTED_ERROR = 'UNSUPPORTED_ERROR',
  PROVIDER_ERROR = 'PROVIDER_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  INVALID_ARGUMENT = 'INVALID_ARGUMENT',
}

export class FactoryError extends Error {
  public type: FactoryErrorType;

  constructor(message: string, type: FactoryErrorType) {
    super(message);
    this.type = type;
  }
}

export const withFactoryError = async <T>(
  fn: () => Promise<T>,
  customErrorType: FactoryErrorType,
  details?: string,
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    let errorMessage = `${customErrorType}: ${(error as Error).message}` || 'UnknownError';
    if (details) {
      errorMessage = `${details}: ${errorMessage}`;
    }
    throw new FactoryError(errorMessage, customErrorType);
  }
};
