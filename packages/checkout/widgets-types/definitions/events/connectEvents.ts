import { ConnectionProviders } from '@imtbl/checkout-sdk-web';
import { OrchestrationEventType } from './orchestrationEvents';

export enum ConnectEventType {
  SUCCESS = 'success',
  FAILURE = 'failure',
  CLOSE_WIDGET = 'close-widget',
}

export type ConnectEvent<T> = {
  type: ConnectEventType | OrchestrationEventType;
  data: T;
};

export type ConnectionSuccess = {
  providerPreference: ConnectionProviders;
};

export type ConnectionFailed = {
  reason: string;
};
