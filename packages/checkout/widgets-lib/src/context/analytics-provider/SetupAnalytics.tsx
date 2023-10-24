import { useEffect } from 'react';
import { getSegmentWriteKey } from './SegmentAnalyticsProvider';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { useAnalytics } from './CustomAnalyticsProvider';

type SetupAnalyticsProps = {
  widgetConfig: StrongCheckoutWidgetsConfig
  children: React.ReactNode;
};

export function SetupAnalytics(
  { widgetConfig, children }: SetupAnalyticsProps,
) {
  const { updateWriteKey } = useAnalytics();

  useEffect(() => {
    const writeKey = getSegmentWriteKey(widgetConfig.environment);
    updateWriteKey(writeKey);
  }, [widgetConfig]);

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return (<>{children}</>);
}
