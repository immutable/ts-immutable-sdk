import { OrchestrationEventType } from './orchestrationEvents';

export type BuyEvent<T> = {
  type: BuyEventType | OrchestrationEventType;
  data: T;
};

export enum BuyEventType {
  SUCCESS = 'success',
  FAILURE = 'failure',
  NOT_CONNECTED = 'not_connected',
  CLOSE = 'close',
}

export type BuyClose = {};

export type BuyNotConnected = {
  providerPreference: string;
};

export type BuySuccess = {
  timestamp: number;
};

export type BuyFailed = {
  reason: string;
  timestamp: number;
};
