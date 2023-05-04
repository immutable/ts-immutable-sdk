/**
 * Represents an event object emitted by the Buy Widget.
 * @see {@link BuyEventType} for possible event types.
 * @typeparam T - The type of data contained in the event.
 * @property {BuyEventType} type - The type of the event.
 * @property {T} data - The data contained in the event.
 */
export type BuyEvent<T> = {
  type: BuyEventType;
  data: T;
};

/**
 * Enum representing possible Buy Widget types.
 * @readonly
 * @enum {string}
 * @property {string} SUCCESS - Event emitted when a buy is successfully completed.
 * @property {string} FAILURE - Event emitted when a buy fails.
 * @property {string} NOT_CONNECTED - Event emitted when a provider is not connected.
 * @property {string} CLOSE - Event emitted when the checkout modal is closed.
 */
export enum BuyEventType {
  SUCCESS = 'success',
  FAILURE = 'failure',
  NOT_CONNECTED = 'not_connected',
  CLOSE = 'close',
}

/**
 * Type representing a Buy Widget with type CLOSE.
 * @property {object} data - Does not contain any data.
 */
export type BuyClose = {};

/**
 * Type representing a Buy Widget with type NOT_CONNECTED.
 * @property {string} providerPreference - The preferred provider for the Buy Widget.
 */
export type BuyNotConnected = {
  providerPreference: string;
};

/**
 * Type representing a Buy Widget with type SUCCESS.
 * @property {number} timestamp - The timestamp of the successful buy.
 */
export type BuySuccess = {
  timestamp: number;
};

/**
 * Type representing a Buy Widget with type FAILURE.
 * @property {string} reason - The reason why the buy failed.
 * @property {number} timestamp - The timestamp of the failed buy.
 */
export type BuyFailed = {
  reason: string;
  timestamp: number;
};
