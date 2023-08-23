import { createAnalytics, StandardAnalyticsControlTypes } from '@imtbl/react-analytics';

export type StandardAnalyticsActions =
  | 'Opened'
  | 'Started'
  | 'Succeeded'
  | 'Failed';

export type AnalyticsControlTypes = StandardAnalyticsControlTypes
| 'Button'
| 'StatusUpdate';

const getWriteKey = () => process.env.NEXT_PUBLIC_SEGMENT_WRITEKEY || 'b69BcXnFXdaiFC6MqRQiHvjcPrTxftZl';

export const { AnalyticsProvider, useAnalytics } = createAnalytics<
'OnRampCrypto',
string,
'Click' | 'StatusEvents',
AnalyticsControlTypes,
StandardAnalyticsActions
>({
  writeKey: getWriteKey(),
  appName: 'Checkout-widgets',
});
