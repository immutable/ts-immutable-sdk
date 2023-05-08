import { NetworkInfo, TokenInfo } from '@imtbl/checkout-sdk';

/**
 * Enum representing possible Wallet Widget event types.
 */
export enum WalletEventType {
  CLOSE_WIDGET = 'close-widget',
  NETWORK_SWITCH = 'network-switch',
  ADD_COINS = 'add-coins',
}

/**
 * Type representing the data emitted by the network switch event.
 * @property {string} network - The name of the selected network.
 * @property {number} chainId - The chain ID of the selected network.
 */
export type WalletNetworkSwitchEvent = {
  network: string;
  chainId: number;
};

export type WalletAddCoinsEvent = {
  network?: NetworkInfo;
  token?: TokenInfo;
  tokenAmount?: string;
};

/**
 * Represents an event object emitted by the Wallet Widget.
 * @property {WalletEventType} type - The type of the event.
 * @property {T} data - The data contained in the event.
 */
export type WalletEvent<T> = {
  type: WalletEventType;
  data: T;
};

