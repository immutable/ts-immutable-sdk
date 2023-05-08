import { NetworkInfo, TokenInfo } from '@imtbl/checkout-sdk';

export type BridgeEvent<T> = {
  type: BridgeEventType;
  data: T;
};

export enum BridgeEventType {
  CLOSE_WIDGET = 'close-widget',
  BRIDGE_COINS = 'bridge-coins',
  SUCCESS = 'success',
  FAILURE = 'failure',
}

export type BridgeSuccess = {
  timestamp: number;
};

export type BridgeFailed = {
  reason: string;
  timestamp: number;
};

export type BridgeCoinsEvent = {
  network?: NetworkInfo;
  token?: TokenInfo;
  maxTokenAmount?: string;
};
