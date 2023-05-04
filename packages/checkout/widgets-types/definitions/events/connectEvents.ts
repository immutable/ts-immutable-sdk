import { ConnectionProviders } from '@imtbl/checkout-sdk-web';

/**
 * Represents an event object emitted by the Connect Widget.
 * @readonly
 * @enum {string}
 * @property {string} SUCCESS - Indicates a successful connection.
 * @property {string} FAILURE - Indicates a failed connection attempt.
 * @property {string} CLOSE_WIDGET - Indicates the user closed the connection widget.
 */
export enum ConnectEventType {
  SUCCESS = 'success',
  FAILURE = 'failure',
  CLOSE_WIDGET = 'close-widget',
}

/**
 * Generic type representing a connection event.
 * @template T - The type of data associated with the event.
 * @property {ConnectEventType} type - The type of event.
 * @property {T} data - The data associated with the event.
 */
export type ConnectEvent<T> = {
  type: ConnectEventType;
  data: T;
};

/**
 * Type representing data associated with a successful connection event.
 * @property {ConnectionProviders} providerPreference - The user's preferred connection provider.
 */
export type ConnectionSuccess = {
  providerPreference: ConnectionProviders;
};

/**
 * Type representing data associated with a failed connection event.
 * @property {string} reason - A description of the reason for the failed connection attempt.
 */
export type ConnectionFailed = {
  reason: string;
};
