/**
 * Represents an event object emitted by the Bridge Widget.
 * @template T - the type of data associated with this event
 * @property {BridgeEventType} type - The type of the event.
 * @property {T} data - The data associated with the event.
 */
export type BridgeEvent<T> = {
  type: BridgeEventType;
  data: T;
};

/**
 * Enumeration of possible Bridge Widget event types.
 */
export enum BridgeEventType {
  CLOSE_WIDGET = 'close-widget',
  SUCCESS = 'success',
  FAILURE = 'failure',
}

/**
 * Represents the data associated with a successful Bridge Widget event.
 * @property {number} timestamp - The UNIX timestamp (in milliseconds) when the event occurred.
 */
export type BridgeSuccess = {
  timestamp: number;
};

/**
 * Represents the data associated with a failed Bridge Widget event.
 * @property {string} reason - The reason for the failure.
 * @property {number} timestamp - The UNIX timestamp (in milliseconds) when the event occurred.
 */
export type BridgeFailed = {
  reason: string;
  timestamp: number;
};
