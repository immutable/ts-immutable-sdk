import {
  createContext, useContext, useMemo,
} from 'react';
import {
  SegmentAppName,
  createAnalyticsInstance,
  getSegmentWriteKey,
} from './segmentAnalyticsConfig';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';

type CustomAnalyticsProps = {
  widgetConfig: StrongCheckoutWidgetsConfig;
  children: React.ReactNode;
  appName?: SegmentAppName;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const CustomAnalyticsContext = createContext({
  useAnalytics: () => ({}),
} as {
  useAnalytics: ReturnType<typeof createAnalyticsInstance>['useAnalytics'];
});

export function CustomAnalyticsProvider({
  widgetConfig,
  appName,
  children,
}: CustomAnalyticsProps) {
  const writeKey = getSegmentWriteKey(widgetConfig.environment, appName);
  const { AnalyticsProvider, useAnalytics } = createAnalyticsInstance(
    writeKey,
    appName,
  );

  const value = useMemo(() => ({ useAnalytics }), [useAnalytics]);

  return (
    <CustomAnalyticsContext.Provider value={value}>
      <AnalyticsProvider>{children}</AnalyticsProvider>
    </CustomAnalyticsContext.Provider>
  );
}

export const useAnalyticsContext = () => useContext(CustomAnalyticsContext);

export const useAnalytics = () => useAnalyticsContext().useAnalytics();
