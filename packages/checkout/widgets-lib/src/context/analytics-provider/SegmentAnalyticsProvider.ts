import {
  createAnalytics,
  StandardAnalyticsControlTypes,
} from '@imtbl/react-analytics';
import type { PropsWithChildren, ReactElement } from 'react';

export enum UserJourney {
  CONNECT = 'Connect',
  WALLET = 'Wallet',
  ON_RAMP = 'OnRamp',
  SWAP = 'Swap',
  BRIDGE = 'Bridge',
  SALE = 'PrimarySale',
  ADD_TOKENS = 'AddTokens',
  PURCHASE = 'Purchase',
  TRANSFER = 'Transfer',
}

export type AnalyticsControlTypes =
  | StandardAnalyticsControlTypes
  | 'IframeEvent'
  | 'Event';

const productName = 'checkout';

const analytics = createAnalytics<
  UserJourney,
  string,
  string,
  AnalyticsControlTypes
>({
  writeKey: '',
  appName: productName,
  storageKeyPrefix: 'checkoutWidgets',
});

// Explicit annotation: createAnalytics returns emotion JSX.Element, which is not portable
export const AnalyticsProvider = analytics.AnalyticsProvider as (
  props: PropsWithChildren,
) => ReactElement;
export const useAnalytics = analytics.useAnalytics;
