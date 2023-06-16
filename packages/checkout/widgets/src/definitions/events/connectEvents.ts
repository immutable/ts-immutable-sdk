import { Web3Provider } from '@ethersproject/providers';
import { WalletProviderName } from '@imtbl/checkout-sdk';

/**
 * Enum representing possible Connect Widget event types.
 */
export enum ConnectEventType {
  SUCCESS = 'success',
  FAILURE = 'failure',
  CLOSE_WIDGET = 'close-widget',
}

/**
 * Represents an event object emitted by the Connect Widget.
 * @property {BuyEventType} type - The type of the event.
 * @property {T} data - The data contained in the event.
 */
export type ConnectEvent<T> = {
  type: ConnectEventType;
  data: T;
};

/**
 * Type representing a Connect Widget event with type SUCCESS.
 * @property {ConnectionProviders} providerPreference - The user's preferred connection provider.
 */
export type ConnectionSuccess = {
  provider: Web3Provider;
  providerName: WalletProviderName | undefined;
};

/**
 * Type representing a Connect Widget event with type FAILURE.
 * @property {string} reason - A description of the reason for the failed connection attempt.
 */
export type ConnectionFailed = {
  reason: string;
};
