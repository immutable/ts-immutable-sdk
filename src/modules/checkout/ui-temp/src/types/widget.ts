import { ConnectionProviders } from '@imtbl/checkout-sdk-web'

export interface WidgetOptions {
  elementId: string,
}

export interface ConnectWidgetOptions extends WidgetOptions {
  params: ConnectWidgetParams,
  theme: "LIGHT"|"DARK"|"CUSTOM",
}

export interface ConnectWidgetProps {
  params: ConnectWidgetParams,
  theme: "LIGHT"|"DARK"|"CUSTOM",
}

export interface ConnectWidgetParams {
  providerPreference?: ConnectionProviders,
}
