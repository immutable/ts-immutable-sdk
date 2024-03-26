import { useCallback, useEffect } from 'react';
import { Checkout } from '@imtbl/checkout-sdk';
import { TelemetryConfig } from '@imtbl/checkout-sdk/dist/types';
import { useAnalytics } from './SegmentAnalyticsProvider';

type SetupAnalyticsProps = {
  children: React.ReactNode;
  checkout: Checkout
};

export function SetupAnalytics(
  { children, checkout }: SetupAnalyticsProps,
) {
  const { updateWriteKey } = useAnalytics();

  const telemetry = useCallback(async () => {
    try {
      return await checkout?.config?.remote.getConfig('telemetry');
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('unable to fetch telemetry config: ', err);
    }
    return undefined;
  }, [checkout]);

  useEffect(() => {
    (async () => {
      const config = await telemetry() as TelemetryConfig;
      if (!config) return;
      updateWriteKey(config.segmentPublishableKey);
    })();
  }, [telemetry]);

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return (<>{children}</>);
}
