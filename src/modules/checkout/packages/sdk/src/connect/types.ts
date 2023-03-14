export enum ConnectionProviders {
  METAMASK = "metamask"
}

export type ConnectParams = {
  providerPreference: ConnectionProviders;
}
