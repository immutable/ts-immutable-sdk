import { ProviderPreference } from "./widget";

export enum IMTBLWidgetEvents {
  IMTBL_CONNECT_WIDGET_EVENT = "imtbl-connect-widget",
  IMTBL_WALLET_WIDGET_EVENT = "imtbl-wallet-widget"
}

export enum ConnectEventType {
  SUCCESS = 'success',
  FAILURE = 'failure'
}

export type ConnectEvent<T> = {
  type: ConnectEventType
  data: T
}

export type ConnectionSuccess = {
  providerPreference: ProviderPreference;
  timestamp: number;
}

export type ConnectionFailed = {
  reason: string;
  timestamp: number;
}
