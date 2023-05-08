import { NetworkInfo, TokenInfo } from '@imtbl/checkout-sdk';

export type OnRampEvent<T> = {
  type: OnRampEventType;
  data: T;
};

export enum OnRampEventType {
  ONRAMP_COINS = 'onramp-coins',
}

export type OnRampCoinsEvent = {
  network?: NetworkInfo;
  token?: TokenInfo;
  maxTokenAmount?: string;
};
