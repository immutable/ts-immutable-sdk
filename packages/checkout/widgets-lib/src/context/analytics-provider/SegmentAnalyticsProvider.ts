import { createAnalytics, StandardAnalyticsActions, StandardAnalyticsControlTypes } from '@imtbl/react-analytics';
import { Environment } from '@imtbl/config';

export type UserJourney = 'OnRamp' | 'Swap' | 'Bridge';
export type AnalyticsControls = 'Click' | 'Confirm' | 'WebhookEvent' | 'WidgetInitialisation';

export type AnalyticsActions = StandardAnalyticsActions
| 'Opened'
| 'Started'
| 'Processing'
| 'Succeeded'
| 'Failed';

export type AnalyticsControlTypes = StandardAnalyticsControlTypes
| 'Button'
| 'Trigger'
| 'WidgetLoad';

const SEGMENT_ANALYTICS_WRITE_KEY = {
  [Environment.SANDBOX]: 'b69BcXnFXdaiFC6MqRQiHvjcPrTxftZl',
  [Environment.PRODUCTION]: 'hecEjBUtJP8IvC9rBx9IkBFR0UuDiIos',
};

export const getSegmentWriteKey = (env: Environment) => SEGMENT_ANALYTICS_WRITE_KEY[env];

// eslint-disable-next-line @typescript-eslint/naming-convention
export const { AnalyticsProvider, useAnalytics } = createAnalytics<
UserJourney,
string,
AnalyticsControls,
AnalyticsControlTypes,
AnalyticsActions
>({
  writeKey: '',
  appName: 'Checkout-widgets',
});
