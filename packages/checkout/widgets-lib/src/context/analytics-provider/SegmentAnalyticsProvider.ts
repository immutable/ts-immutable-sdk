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
  SALE = 'PrimarySale',
}

export type AnalyticsControlTypes =
  | StandardAnalyticsControlTypes
  | 'IframeEvent'
  | 'Event';

const SEGMENT_ANALYTICS_WRITE_KEY = {
  [Environment.SANDBOX]: 'b69BcXnFXdaiFC6MqRQiHvjcPrTxftZl',
  [Environment.PRODUCTION]: 'hecEjBUtJP8IvC9rBx9IkBFR0UuDiIos',
};

export const getSegmentWriteKey = (env: Environment) => SEGMENT_ANALYTICS_WRITE_KEY[env];

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
