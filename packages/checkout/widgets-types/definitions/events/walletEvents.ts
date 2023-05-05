import { NetworkInfo, TokenInfo } from '@imtbl/checkout-sdk-web';

export enum WalletEventType {
  CLOSE_WIDGET = 'close-widget',
  NETWORK_SWITCH = 'network-switch',
  ADD_COINS = 'add-coins',
}

export type WalletNetworkSwitchEvent = {
  network: string;
  chainId: number;
};

export type WalletAddCoinsEvent = {
  network?: NetworkInfo;
  token?: TokenInfo;
  tokenAmount?: string;
};

export type WalletEvent<T> = {
  type: WalletEventType;
  data: T;
};
