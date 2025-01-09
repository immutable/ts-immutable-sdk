import { Token } from './types';

export class RouteError extends Error {
  constructor(
    public message: string,
    public data?: {
      fromToken?: Token;
      toToken?: Token;
      fromChain?: string | number;
      toChain?: string | number;
      errorStatus?: number;
      errorMessage?: string;
      errorStack?: string;
    },
  ) {
    super(message);
    Object.setPrototypeOf(this, RouteError.prototype);
  }
}
