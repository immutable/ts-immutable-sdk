/**
 * @enum {string} Errors that can be returned by the Exchange.
 */
export enum ExchangeErrorCode {
  INVALID_SLIPPAGE = 'INVALID_SLIPPAGE',
  INVALID_MAX_HOPS = 'INVALID_MAX_HOPS',
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  DUPLICATE_ADDRESSES = 'DUPLICATE_ADDRESSES',
  CHAIN_NOT_SUPPORTED = 'CHAIN_NOT_SUPPORTED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  UNABLE_TO_RETRIEVE_ROUTE = 'UNABLE_TO_RETRIEVE_ROUTE',
  NO_ROUTES_AVAILABLE = 'NO_ROUTES_AVAILABLE',
  PROVIDER_CALL_ERROR = 'PROVIDER_CALL_ERROR',
}

/**
 * @enum {string} Error messages that can exist in ExchangeError
 */
export enum ExchangeErrorMessage {
  INVALID_TOKEN_IN = 'invalid token in address',
  INVALID_TOKEN_OUT = 'invalid token out address',
  INVALID_FROM = 'invalid from address',
  DUPLICATE_ADDRESSES = 'token in and token out addresses must be different',
  MAX_HOPS_TOO_HIGH = 'max hops must be less than or equal to 10',
  MAX_HOPS_TOO_LOW = 'max hops must be greater than or equal to 1',
  SLIPPAGE_TOO_HIGH = 'slippage percent must be less than or equal to 50',
  SLIPPAGE_TOO_LOW = 'slippage percent must be greater than or equal to 0',
  INTERNAL_ERROR = 'internal error',
  UNABLE_TO_RETRIEVE_ROUTE = 'unable to retrieve route for tokens',
  NO_ROUTES_AVAILABLE = 'no routes available',
  PROVIDER_REQUEST_FAILED = 'failed to make request',
  FAILED_TO_GET_ERC20_DECIMALS = 'failed to get ERC20 decimals',
  FAILED_MULTICALL = 'failed multicall',
}

/**
 * The type signature for an error.
 * Contains a type that corresponds to a {@link ExchangeError} and an optional message string.
 */
export type ExchangeErrorType = {
  type: ExchangeError,
  message: string,
};

/**
 * The {@link ExchangeError} error class that extends the {@link Error} class.
 * Contains a message string and a type that corresponds to an {@link ExchangeErrorCode}.
 * It has a constructor that takes in a message string and a type.
 */
export class ExchangeError extends Error {
  public message: string;

  public code: ExchangeErrorCode;

  constructor(message: string, code: ExchangeErrorCode) {
    super(message);
    this.message = message;
    this.code = code;
  }
}

export class ChainNotSupportedError extends ExchangeError {
  constructor(chain: number) {
    const message = `Chain with ID ${chain} is not a supported chain`;

    super(message, ExchangeErrorCode.CHAIN_NOT_SUPPORTED);
  }
}

export class InvalidSlippageError extends ExchangeError {
  constructor(message: string) {
    super(message, ExchangeErrorCode.INVALID_SLIPPAGE);
  }
}

export class InvalidMaxHopsError extends ExchangeError {
  constructor(message: string) {
    super(message, ExchangeErrorCode.INVALID_MAX_HOPS);
  }
}

export class InvalidAddressError extends ExchangeError {
  constructor(message: string) {
    super(message, ExchangeErrorCode.INVALID_ADDRESS);
  }
}

export class DuplicateAddressesError extends ExchangeError {
  constructor() {
    super(ExchangeErrorMessage.DUPLICATE_ADDRESSES, ExchangeErrorCode.DUPLICATE_ADDRESSES);
  }
}

export class NoRoutesAvailableError extends ExchangeError {
  constructor() {
    super(ExchangeErrorMessage.NO_ROUTES_AVAILABLE, ExchangeErrorCode.NO_ROUTES_AVAILABLE);
  }
}

export class ProviderCallError extends ExchangeError {
  constructor(message: string) {
    super(message, ExchangeErrorCode.PROVIDER_CALL_ERROR);
  }
}
