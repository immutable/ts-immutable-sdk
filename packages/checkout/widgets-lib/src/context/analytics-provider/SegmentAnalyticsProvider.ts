import { createAnalytics, StandardAnalyticsActions, StandardAnalyticsControlTypes } from '@imtbl/react-analytics';
import { Environment } from '@imtbl/config';

export enum UserJourney {
  ON_RAMP = 'OnRamp',
  SWAP = 'Swap',
  BRIDGE = 'Bridge',
}

export type AnalyticsControlTypes = StandardAnalyticsControlTypes
| 'IframeEvent';

const SEGMENT_ANALYTICS_WRITE_KEY = {
  [Environment.SANDBOX]: 'b69BcXnFXdaiFC6MqRQiHvjcPrTxftZl',
  [Environment.PRODUCTION]: 'hecEjBUtJP8IvC9rBx9IkBFR0UuDiIos',
};

export const getSegmentWriteKey = (env: Environment) => SEGMENT_ANALYTICS_WRITE_KEY[env];

// eslint-disable-next-line @typescript-eslint/naming-convention
export const { AnalyticsProvider, useAnalytics } = createAnalytics<
UserJourney,
string,
string,
AnalyticsControlTypes,
StandardAnalyticsActions
>({
  writeKey: '',
  appName: 'checkout',
});
