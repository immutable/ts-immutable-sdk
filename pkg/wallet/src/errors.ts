/**
 * JSON-RPC error codes
 * @see https://eips.ethereum.org/EIPS/eip-1193#provider-errors
 * @see https://eips.ethereum.org/EIPS/eip-1474#error-codes
 */

export enum ProviderErrorCode {
  UNAUTHORIZED = 4100,
  UNSUPPORTED_METHOD = 4200,
}

export enum RpcErrorCode {
  RPC_SERVER_ERROR = -32000,
  INVALID_PARAMS = -32602,
  INTERNAL_ERROR = -32603,
  TRANSACTION_REJECTED = -32003,
}

export class JsonRpcError extends Error {
  public readonly code: ProviderErrorCode | RpcErrorCode;

  constructor(code: ProviderErrorCode | RpcErrorCode, message: string) {
    super(message);
    this.name = 'JsonRpcError';
    this.code = code;
  }
}
