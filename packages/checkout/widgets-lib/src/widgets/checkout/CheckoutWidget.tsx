import { useEffect, useState } from 'react';
import { Box } from '@biom3/react';
import { CheckoutWidgetParams, Checkout } from '@imtbl/checkout-sdk';

import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { getIframeURL } from './functions/iframeParams';

export type CheckoutWidgetInputs = {
  checkout: Checkout;
  config: StrongCheckoutWidgetsConfig;
  params: CheckoutWidgetParams;
};

export default function CheckoutWidget(props: CheckoutWidgetInputs) {
  const { config, checkout, params } = props;
  const { environment } = config;
  const { publishableKey } = checkout.config;

  const [iframeURL, setIframeURL] = useState<string>();

  useEffect(() => {
    if (!publishableKey || !params.language) return;

    const url = getIframeURL(params, environment, publishableKey);

    setIframeURL(url);
  }, [publishableKey, params]);

  // TODO:
  // on iframe load error, go to error view 500
  // on iframe loading, show loading view, requires iframe to trigger an initialised event

  if (!iframeURL) {
    return null;
  }

  return (
    <Box
      rc={<iframe src={iframeURL} title="checkout" />}
      sx={{
        w: '100%',
        h: '100%',
        border: 'none',
        boxShadow: 'none',
      }}
    />
  );
}
