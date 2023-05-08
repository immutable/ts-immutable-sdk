import { NetworkInfo, TokenInfo } from '@imtbl/checkout-sdk';

export type OnRampEvent<T> = {
  type: OnRampEventType;
  data: T;
};

export enum OnRampEventType {
}