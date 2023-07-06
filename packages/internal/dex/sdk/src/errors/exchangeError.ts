import { Environment } from '@imtbl/config';

/**
 * @enum {string} Errors that can be returned by the Exchange.
 */
export enum ExchangeErrorCode {
  INVALID_CONFIGURATION = 'INVALID_CONFIGURATION',
  INVALID_SLIPPAGE = 'INVALID_SLIPPAGE',
  INVALID_MAX_HOPS = 'INVALID_MAX_HOPS',
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  DUPLICATE_ADDRESSES = 'DUPLICATE_ADDRESSES',
  CHAIN_NOT_SUPPORTED = 'CHAIN_NOT_SUPPORTED',
  NO_ROUTES_AVAILABLE = 'NO_ROUTES_AVAILABLE',
  PROVIDER_CALL_ERROR = 'PROVIDER_CALL_ERROR',
  APPROVE_ERROR = 'APPROVE_ERROR',
  ALREADY_APPROVED_ERROR = 'ALREADY_APPROVED_ERROR',
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

export class InvalidConfigurationError extends ExchangeError {
  constructor() {
    const message = 'Invalid configuration';

    super(message, ExchangeErrorCode.INVALID_CONFIGURATION);
  }
}

export class ChainNotSupportedError extends ExchangeError {
  constructor(chain: number, environment: Environment) {
    const message = `Chain with ID ${chain} is not a supported chain in environment ${environment}`;

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
    super('token in and token out addresses must be different', ExchangeErrorCode.DUPLICATE_ADDRESSES);
  }
}

export class NoRoutesAvailableError extends ExchangeError {
  constructor() {
    super('no routes available', ExchangeErrorCode.NO_ROUTES_AVAILABLE);
  }
}

export class ProviderCallError extends ExchangeError {
  constructor(message: string) {
    super(message, ExchangeErrorCode.PROVIDER_CALL_ERROR);
  }
}

export class ApproveError extends ExchangeError {
  constructor(message: string) {
    super(message, ExchangeErrorCode.APPROVE_ERROR);
  }
}

export class AlreadyApprovedError extends ExchangeError {
  public tokenAddress: string;

  public spenderAddress: string;

  constructor(amountApproved: string, tokenAddress: string, spenderAddress: string) {
    super(`already approved ${amountApproved} tokens`, ExchangeErrorCode.ALREADY_APPROVED_ERROR);
    this.tokenAddress = tokenAddress;
    this.spenderAddress = spenderAddress;
  }
}
