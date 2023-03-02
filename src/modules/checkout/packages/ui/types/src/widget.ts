export interface WidgetOptions {
  elementId: string,
  theme: "LIGHT"|"DARK"|"CUSTOM",
}

export enum ProviderPreference {
  METAMASK = "METAMASK",
  WALLET_CONNECT = "WALLET_CONNECT",
}

export interface ConnectWidgetOptions extends WidgetOptions {
  params: ConnectWidgetParams,
}

export interface ConnectWidgetParams {
  providerPreference?: ProviderPreference,
}
