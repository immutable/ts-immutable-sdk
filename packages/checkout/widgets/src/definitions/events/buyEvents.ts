import { OrchestrationEventType } from './orchestrationEvents';

/**
 * Enum representing possible Buy Widget event types.
 */
export enum BuyEventType {
  CLOSE_WIDGET = 'close-widget',
  SUCCESS = 'success',
  FAILURE = 'failure',
  NOT_CONNECTED = 'not_connected',
}

/**
 * Represents an event object emitted by the Buy Widget.
 * @property {BuyEventType} type - The type of the event.
 * @property {T} data - The data contained in the event.
 */
export type BuyEvent<T> = {
  type: BuyEventType | OrchestrationEventType;
  data: T;
};

/**
 * Type representing a Buy Widget event with type CLOSE.
 */
export type BuyClose = {};

/**
 * Type representing a Buy Widget event with type NOT_CONNECTED.
 * @property {string} providerPreference - The preferred provider used for the connection within the Buy Widget.
 */
export type BuyNotConnected = {
  providerPreference: string;
};

/**
 * Type representing a Buy Widget event with type SUCCESS.
 * @property {number} timestamp - The timestamp of the successful buy.
 */
export type BuySuccess = {
  timestamp: number;
};

/**
 * Type representing a Buy Widget event with type FAILURE.
 * @property {string} reason - The reason why the buy failed.
 * @property {number} timestamp - The timestamp of the failed buy.
 */
export type BuyFailed = {
  reason: string;
  timestamp: number;
};
