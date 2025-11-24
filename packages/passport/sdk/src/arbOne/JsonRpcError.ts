export enum ProviderErrorCode {
  UNSUPPORTED_METHOD = 4200,
  UNAUTHORIZED = 4100,
  USER_REJECTED_REQUEST = 4001,
}

export enum RpcErrorCode {
  INTERNAL_ERROR = -32603,
  INVALID_PARAMS = -32602,
  INVALID_REQUEST = -32600,
}

export class JsonRpcError extends Error {
  public code: number;

  public data?: any;

  constructor(code: number, message: string, data?: any) {
    super(message);
    this.code = code;
    this.data = data;
    this.name = 'JsonRpcError';

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, JsonRpcError);
    }
  }

  public toJSON() {
    return {
      code: this.code,
      message: this.message,
      data: this.data,
    };
  }
}

