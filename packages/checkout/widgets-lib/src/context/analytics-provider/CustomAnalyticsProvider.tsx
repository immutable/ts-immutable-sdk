import { Checkout } from '@imtbl/checkout-sdk';
import {
  AnalyticsProvider,
} from './SegmentAnalyticsProvider';
import { SetupAnalytics } from './SetupAnalytics';

type CustomAnalyticsProps = {
  children: React.ReactNode;
  checkout: Checkout;
};

export function CustomAnalyticsProvider(
  { children, checkout }: CustomAnalyticsProps,
) {
  return (
    <AnalyticsProvider>
      <SetupAnalytics checkout={checkout}>
        {children}
      </SetupAnalytics>
    </AnalyticsProvider>
  );
}
