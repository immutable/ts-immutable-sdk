import { OrchestrationEventType } from './orchestrationEvents';

export type BridgeEvent<T> = {
  type: BridgeEventType | OrchestrationEventType;
  data: T;
};

export enum BridgeEventType {
  CLOSE_WIDGET = 'close-widget',
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
