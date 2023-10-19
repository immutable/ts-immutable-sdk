import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { createCustomAnalytics } from './SetupAnalytics';

type CustomAnalyticsProps = {
  children: React.ReactNode;
  productName: 'checkout' | 'sale';
  widgetConfig: StrongCheckoutWidgetsConfig
};

export function CustomAnalyticsProvider(
  { productName, widgetConfig, children }: CustomAnalyticsProps,
) {
  const { AnalyticsProvider } = createCustomAnalytics({ widgetConfig, productName });
  return (
    <AnalyticsProvider>
      {children}
    </AnalyticsProvider>
  );
}
