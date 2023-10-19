import { useEffect } from 'react';
import {
  getSegmentWriteKey,
  createAnalytics,
} from './SegmentAnalyticsProvider';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';

type SetupAnalyticsProps = {
  children: React.ReactNode;
  productName: 'checkout' | 'sale';
  widgetConfig: StrongCheckoutWidgetsConfig;
};

// export function SetupAnalytics( { widgetConfig, children }: SetupAnalyticsProps, ) {
//    const { updateWriteKey } = useAnalytics();

//   useEffect(() => {
//     const writeKey = getSegmentWriteKey(widgetConfig.environment);
//     updateWriteKey(writeKey);
//   }, [widgetConfig]);

//   // eslint-disable-next-line react/jsx-no-useless-fragment
//   return (<>{children}</>);
// }

export const createCustomAnalytics = (props: SetupAnalyticsProps) => {
  const { productName, widgetConfig, children } = props;
  const appName = productName || 'checkout';

  const { AnalyticsProvider, useAnalytics } = createAnalytics(appName);

  function SetupAnalytics() {
    const { updateWriteKey } = useAnalytics();

    useEffect(() => {
      const writeKey = getSegmentWriteKey(widgetConfig.environment);
      updateWriteKey(writeKey);
    }, [widgetConfig]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return (<>{children}</>);
  }

  return {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    AnalyticsProvider,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    SetupAnalytics,
    useAnalytics,
  };
};
