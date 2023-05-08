import { NetworkInfo, TokenInfo } from '@imtbl/checkout-sdk';

/**
 * Represents an event object emitted by the Bridge Widget.
 * @property {BridgeEventType} type - The type of the event.
 * @property {T} data - The data associated with the event.
 */
export type BridgeEvent<T> = {
  type: BridgeEventType;
  data: T;
};

/**
 * Enum of possible Bridge Widget event types.
 */
export enum BridgeEventType {
  CLOSE_WIDGET = 'close-widget',
  BRIDGE_COINS = 'bridge-coins',
  SUCCESS = 'success',
  FAILURE = 'failure',
}

/**
 * Type representing a Bridge Widget event with type SUCCESS
 * @property {number} timestamp - The UNIX timestamp (in milliseconds) when the event occurred.
 */
export type BridgeSuccess = {
  timestamp: number;
};

/**
 * Type representing a Bridge Widget event with type FAILURE
 * @property {string} reason - The reason for the failure.
 * @property {number} timestamp - The UNIX timestamp (in milliseconds) when the event occurred.
 */
export type BridgeFailed = {
  reason: string;
  timestamp: number;
};

export type BridgeCoinsEvent = {
  network?: NetworkInfo;
  token?: TokenInfo;
  maxTokenAmount?: string;
};
