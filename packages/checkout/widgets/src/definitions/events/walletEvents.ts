//wallet widget events

export enum WalletEventType {
  CLOSE_WIDGET = 'close-widget',
  NETWORK_SWITCH = 'network-switch',
}

export type WalletNetworkSwitchEvent = {
  network: string;
  chainId: number;
};

export type WalletEvent<T> = {
  type: WalletEventType;
  data: T;
};
