import { ConnectionProviders } from '@imtbl/checkout-sdk';

/**
 * Enum representing possible Connect Widget event types.
 */
export enum ConnectEventType {
  CLOSE_WIDGET = 'close-widget',
  SUCCESS = 'success',
  FAILURE = 'failure',
}

/**
 * Type representing a Connect Widget event with type SUCCESS.
 * @property {ConnectionProviders} providerPreference - The user's preferred connection provider.
 */
export type ConnectionSuccess = {
  providerPreference: ConnectionProviders;
};

/**
 * Type representing a Connect Widget event with type FAILURE.
 * @property {string} reason - A description of the reason for the failed connection attempt.
 */
export type ConnectionFailed = {
  reason: string;
};
