import { createAnalytics, StandardAnalyticsActions, StandardAnalyticsControlTypes } from '@imtbl/react-analytics';

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

// for prod: hecEjBUtJP8IvC9rBx9IkBFR0UuDiIos
const getWriteKey = () => 'b69BcXnFXdaiFC6MqRQiHvjcPrTxftZl'; // for dev

export const { AnalyticsProvider, useAnalytics } = createAnalytics<
'OnRamp' | 'Swap' | 'Bridge',
string,
'Click' | 'Confirm' | 'WebhookEvent',
AnalyticsControlTypes,
AnalyticsActions
>({
  writeKey: getWriteKey(),
  appName: 'Checkout-widgets',
});
