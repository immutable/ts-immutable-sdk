import {
  createAnalytics,
  StandardAnalyticsActions,
  StandardAnalyticsControlTypes,
} from '@imtbl/react-analytics';

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
