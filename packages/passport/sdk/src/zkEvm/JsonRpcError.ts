export enum RpcErrorCode {
  RPC_SERVER_ERROR = -32000,
  INVALID_REQUEST = -32600,
  METHOD_NOT_FOUND = -32601,
  INVALID_PARAMS = -32602,
  INTERNAL_ERROR = -32603,
  UNAUTHORIZED = -32604,
  PARSE_ERROR = -32700,
}

export class JsonRpcError extends Error {
  public readonly message: string;

  public readonly code: RpcErrorCode;

  constructor(code: RpcErrorCode, message: string) {
    super(message);
    this.message = message;
    this.code = code;
  }
}
