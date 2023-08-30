import {
  AnalyticsProvider,
} from '../../context/segment-provider/SegmentAnalyticsProvider';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { SetupAnalytics } from './SetupAnalytics';

type CustomAnalyticsProps = {
  widgetConfig: StrongCheckoutWidgetsConfig
  children: React.ReactNode;
};

export function CustomAnalyticsProvider(
  { widgetConfig, children }: CustomAnalyticsProps,
) {
  return (
    <AnalyticsProvider>
      <SetupAnalytics widgetConfig={widgetConfig}>
        {children}
      </SetupAnalytics>
    </AnalyticsProvider>
  );
}
