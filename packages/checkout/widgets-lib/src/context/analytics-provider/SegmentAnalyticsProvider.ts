import {
  createAnalytics as _createAnalytics,
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

const SEGMENT_ANALYTICS_WRITE_KEY = {
  [Environment.SANDBOX]: 'b69BcXnFXdaiFC6MqRQiHvjcPrTxftZl',
  [Environment.PRODUCTION]: 'hecEjBUtJP8IvC9rBx9IkBFR0UuDiIos',
};

export const getSegmentWriteKey = (env: Environment) => SEGMENT_ANALYTICS_WRITE_KEY[env];

export const createAnalytics = (appName = 'checkout') => _createAnalytics<
UserJourney,
string,
string,
AnalyticsControlTypes,
StandardAnalyticsActions
>({
  appName,
  writeKey: '',
});
