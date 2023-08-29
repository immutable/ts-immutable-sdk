import { createAnalytics, StandardAnalyticsActions, StandardAnalyticsControlTypes } from '@imtbl/react-analytics';
import { Environment } from '@imtbl/config';

export type AnalyticsActions = StandardAnalyticsActions
| 'Opened'
| 'Started'
| 'Processing'
| 'Succeeded'
| 'Failed';

export type AnalyticsControlTypes = StandardAnalyticsControlTypes
| 'Button'
| 'Trigger'
| 'OnRampWidget';

export const getSegmentWriteKey = (env: Environment) => (env === Environment.PRODUCTION
  ? 'hecEjBUtJP8IvC9rBx9IkBFR0UuDiIos'
  : 'b69BcXnFXdaiFC6MqRQiHvjcPrTxftZl');

// eslint-disable-next-line @typescript-eslint/naming-convention
export const { AnalyticsProvider, useAnalytics } = createAnalytics<
'OnRamp' | 'Swap' | 'Bridge',
string,
'Click' | 'Confirm' | 'WebhookEvent' | 'widgetLoad',
AnalyticsControlTypes,
AnalyticsActions
>({
  writeKey: 'b69BcXnFXdaiFC6MqRQiHvjcPrTxftZl', // todo: removing this initial key and relyin gon update isn't working
  appName: 'Checkout-widgets',
});
