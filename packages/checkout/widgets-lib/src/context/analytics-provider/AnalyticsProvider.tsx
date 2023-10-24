import {
  createAnalytics,
  StandardAnalyticsActions,
} from '@imtbl/react-analytics';
import React, {
  createContext, useContext, useEffect, useMemo,
} from 'react';

import {
  AnalyticsControlTypes,
  UserJourney,
  getSegmentWriteKey,
  SegmentAppName,
} from './SegmentAnalyticsProvider';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';

const createAnalyticsInstance = (writeKey: string, appName: string) => createAnalytics<
UserJourney,
string,
string,
AnalyticsControlTypes,
StandardAnalyticsActions
>({
  writeKey,
  appName,
});

// eslint-disable-next-line @typescript-eslint/naming-convention
export const CustomAnalyticsContext = createContext(
  createAnalyticsInstance('', 'any'),
);

type CustomAnalyticsProviderProps = {
  children: React.ReactNode;
  appName: SegmentAppName;
  widgetConfig: StrongCheckoutWidgetsConfig;
};

function CustomAnalyticsProvider({
  children,
  appName,
  widgetConfig,
}: CustomAnalyticsProviderProps) {
  const writeKey = getSegmentWriteKey(widgetConfig.environment, appName);
  console.log('🚀 ~ writeKey:', writeKey);
  const analytics = createAnalyticsInstance(writeKey, appName);
  const { updateWriteKey } = analytics.useAnalytics();

  useEffect(() => updateWriteKey(writeKey), [widgetConfig, appName]);

  const values = useMemo(() => analytics, [analytics]);

  return (
    <CustomAnalyticsContext.Provider value={values}>
      {children}
    </CustomAnalyticsContext.Provider>
  );
}

export const useAnalyticsContext = () => useContext(CustomAnalyticsContext);

function AnalyticsProviderWrapper({ children }: { children: React.ReactNode }) {
  console.log('🚀 ~ AnalyticsProviderWrapper:');
  const { AnalyticsProvider: Provider } = useAnalyticsContext();
  return <Provider>{children}</Provider>;
}

export function AnalyticsProvider({
  appName,
  widgetConfig,
  children,
}: CustomAnalyticsProviderProps) {
  console.log('🚀 ~ AnalyticsProvider:');
  return (
    <CustomAnalyticsProvider appName={appName} widgetConfig={widgetConfig}>
      <AnalyticsProviderWrapper>{children}</AnalyticsProviderWrapper>
    </CustomAnalyticsProvider>
  );
}

export const useAnalytics = () => useAnalyticsContext().useAnalytics();
