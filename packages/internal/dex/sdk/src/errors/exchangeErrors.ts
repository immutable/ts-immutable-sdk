export enum ExchangeErrorTypes {
  INVALID_SLIPPAGE = 'invalid slippage amount',
  INVALID_CHAIN = 'invalid chain id',
  INVALID_MAX_HOPS = 'invalid max hops amount',
}

export class ExchangeError extends Error {
  constructor(public message: string) {
    super(message);
  }
}
