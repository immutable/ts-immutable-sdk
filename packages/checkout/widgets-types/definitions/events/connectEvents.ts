import { ConnectionProviders } from '@imtbl/checkout-sdk-web';

export enum ConnectEventType {
  SUCCESS = 'success',
  FAILURE = 'failure',
}

export type ConnectEvent<T> = {
  type: ConnectEventType;
  data: T;
};

export type ConnectionSuccess = {
  providerPreference: ConnectionProviders;
  timestamp: number;
};

export type ConnectionFailed = {
  reason: string;
  timestamp: number;
};
