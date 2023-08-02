/**
 * ProviderErrors should take priority over RpcErrorCodes
 */
export enum ProviderErrorCode {
  USER_REJECTED_REQUEST = 4001,
  UNAUTHORIZED = 4100,
  UNSUPPORTED_METHOD = 4200,
  DISCONNECTED = 4900,
}

export enum RpcErrorCode {
  RPC_SERVER_ERROR = -32000,
  INVALID_REQUEST = -32600,
  METHOD_NOT_FOUND = -32601,
  INVALID_PARAMS = -32602,
  INTERNAL_ERROR = -32603,
  PARSE_ERROR = -32700,
  USER_REJECTED_REQUEST = -32003,
}

export class JsonRpcError extends Error {
  public readonly message: string;

  public readonly code: ProviderErrorCode | RpcErrorCode;

  constructor(code: ProviderErrorCode | RpcErrorCode, message: string) {
    super(message);
    this.message = message;
    this.code = code;
  }
}
