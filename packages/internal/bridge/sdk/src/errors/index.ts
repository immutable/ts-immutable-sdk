/**
 * @enum {string} BridgeErrorType - Enumeration of different types of bridge errors.
 */
export enum BridgeErrorType {
  UNSUPPORTED_ERROR = 'UNSUPPORTED_ERROR',
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  PROVIDER_ERROR = 'PROVIDER_ERROR',
  ROOT_PROVIDER_ERROR = 'ROOT_PROVIDER_ERROR',
  CHILD_PROVIDER_ERROR = 'CHILD_PROVIDER_ERROR',
  TRANSACTION_REVERTED = 'TRANSACTION_REVERTED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  INVALID_TRANSACTION = 'INVALID_TRANSACTION',
  INVALID_SOURCE_CHAIN_ID = 'INVALID_SOURCE_CHAIN_ID',
  INVALID_DESTINATION_CHAIN_ID = 'INVALID_DESTINATION_CHAIN_ID',
  CHAIN_IDS_MATCH = 'CHAIN_IDS_MATCH',
  AXELAR_CHAIN_NOT_FOUND = 'AXELAR_CHAIN_NOT_FOUND',
  AXELAR_GAS_ESTIMATE_FAILED = 'AXELAR_GAS_ESTIMATE_FAILED',
  INVALID_RECIPIENT = 'INVALID_RECIPIENT',
  FLOW_RATE_ERROR = 'FLOW_RATE_ERROR',
}

/**
 * Represents a custom error for bridge operations.
 * @extends Error
 */
export class BridgeError extends Error {
  /**
   * @property {BridgeErrorType} type - The type of the bridge error.
   */
  public type: BridgeErrorType;

  /**
   * Constructs a BridgeError instance.
   *
   * @param {string} message - The error message.
   * @param {BridgeErrorType} type - The type of the bridge error.
   */
  constructor(message: string, type: BridgeErrorType) {
    super(message);
    this.type = type;
  }
}

/**
 * A helper function that wraps a Promise function with error handling for bridge operations.
 *
 * @template T - The type of the value that the Promise resolves to.
 * @param {() => Promise<T>} fn - The function to wrap with error handling.
 * @param {BridgeErrorType} customErrorType - The custom error type to use for the error.
 * @param {string} [details] - Additional details to add to the error message.
 * @returns {Promise<T>} The result of the wrapped function or a rejected promise with a BridgeError.
 */
export const withBridgeError = async <T>(
  fn: () => Promise<T>,
  customErrorType: BridgeErrorType,
  details?: string,
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    let errorMessage = `${customErrorType}: ${(error as Error).message}` || 'UnknownError';
    if (details) {
      errorMessage = `${details}: ${errorMessage}`;
    }
    throw new BridgeError(errorMessage, customErrorType);
  }
};
