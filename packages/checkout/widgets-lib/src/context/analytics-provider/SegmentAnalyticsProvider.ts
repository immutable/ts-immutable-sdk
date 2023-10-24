import {
  createAnalytics,
  StandardAnalyticsActions,
  StandardAnalyticsControlTypes,
} from '@imtbl/react-analytics';
import { Environment } from '@imtbl/config';

export enum UserJourney {
  CONNECT = 'Connect',
  WALLET = 'Wallet',
  ON_RAMP = 'OnRamp',
  SWAP = 'Swap',
  BRIDGE = 'Bridge',
  SALE = 'Sale',
}

export type AnalyticsControlTypes =
  | StandardAnalyticsControlTypes
  | 'IframeEvent'
  | 'Event';

export type TrackEventProps = {
  screen: string;
  userJourney: UserJourney;
  control: string;
  controlType: AnalyticsControlTypes;
  action?: StandardAnalyticsActions | undefined;
  userId?: string | undefined;
} & Record<string, unknown>;

export enum SegmentAppName {
  CHECKOUT = 'checkout',
  SALE = 'portfoliogame',
}

const SEGMENT_ANALYTICS_WRITE_KEYS = {
  [SegmentAppName.CHECKOUT]: {
    [Environment.SANDBOX]: 'b69BcXnFXdaiFC6MqRQiHvjcPrTxftZl',
    [Environment.PRODUCTION]: 'hecEjBUtJP8IvC9rBx9IkBFR0UuDiIos',
  },
  [SegmentAppName.SALE]: {
    [Environment.SANDBOX]: 'b69BcXnFXdaiFC6MqRQiHvjcPrTxftZl',
    [Environment.PRODUCTION]: 'hecEjBUtJP8IvC9rBx9IkBFR0UuDiIos',
  },
};

export const getSegmentWriteKey = (
  environment: Environment,
  writeKey: SegmentAppName = SegmentAppName.CHECKOUT,
): string => SEGMENT_ANALYTICS_WRITE_KEYS[writeKey][environment];

const productName = 'checkout';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const { AnalyticsProvider, useAnalytics } = createAnalytics<
UserJourney,
string,
string,
AnalyticsControlTypes,
StandardAnalyticsActions
>({
  writeKey: '',
  appName: productName,
});

export const createAnalyticsInstance = (writeKey: string, appName: any) => createAnalytics<
UserJourney,
string,
string,
AnalyticsControlTypes,
StandardAnalyticsActions
>({
  writeKey,
  appName,
});
