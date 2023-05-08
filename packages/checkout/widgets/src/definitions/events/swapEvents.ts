import { NetworkInfo, TokenInfo } from '@imtbl/checkout-sdk';

export type SwapEvent<T> = {
  type: SwapEventType;
  data: T;
};

export enum SwapEventType {
  SUCCESS = 'success',
  FAILURE = 'failure',
  SWAP_COINS = 'swap-coins',
}

export type SwapSuccess = {
  timestamp: number;
};

export type SwapFailed = {
  reason: string;
  timestamp: number;
};

export type SwapCoinsEvent = {
  network?: NetworkInfo;
  token?: TokenInfo;
  maxTokenAmount?: string;
};
