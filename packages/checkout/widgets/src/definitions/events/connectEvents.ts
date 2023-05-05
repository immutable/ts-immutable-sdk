import { WidgetConnectionProviders } from '../constants';

export enum ConnectEventType {
  SUCCESS = 'success',
  FAILURE = 'failure',
  CLOSE_WIDGET = 'close-widget',
}

export type ConnectEvent<T> = {
  type: ConnectEventType;
  data: T;
};

export type ConnectionSuccess = {
  providerPreference: WidgetConnectionProviders;
};

export type ConnectionFailed = {
  reason: string;
};
