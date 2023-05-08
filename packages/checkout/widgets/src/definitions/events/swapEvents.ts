/**
 * Represents an event object emitted by the Swap Widget.
 * @property {SwapEventType} type - The type of the event.
 * @property {T} data - The data contained in the event.
 */
export type SwapEvent<T> = {
  type: SwapEventType;
  data: T;
};

/**
 * Enum representing possible Swap Widget event types.
 */
export enum SwapEventType {
  SUCCESS = 'success',
  FAILURE = 'failure',
}

/**
 * Type representing a Swap Widget with type SUCCESS.
 * @property {number} timestamp - The timestamp of the successful swap.
 */
export type SwapSuccess = {
  timestamp: number;
};

/**
 * Type representing a Swap Widget with type FAILURE.
 * @property {string} reason - The reason why the swap failed.
 * @property {number} timestamp - The timestamp of the failed swap.
 */
export type SwapFailed = {
  reason: string;
  timestamp: number;
};