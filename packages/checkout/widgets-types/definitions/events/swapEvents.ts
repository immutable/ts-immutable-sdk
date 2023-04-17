export type SwapEvent<T> = {
  type: SwapEventType;
  data: T;
};

export enum SwapEventType {
  SUCCESS = 'success',
  FAILURE = 'failure',
}

export type SwapSuccess = {
  timestamp: number;
};

export type SwapFailed = {
  reason: string;
  timestamp: number;
};
