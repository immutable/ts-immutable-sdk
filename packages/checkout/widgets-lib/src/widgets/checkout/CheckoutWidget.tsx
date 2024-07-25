import { useEffect, useState } from 'react';
import { Box } from '@biom3/react';
import { CheckoutWidgetParams, Checkout, CheckoutWidgetConfiguration } from '@imtbl/checkout-sdk';

import { getIframeURL } from './functions/iframeParams';

export type CheckoutWidgetInputs = {
  checkout: Checkout;
  params: CheckoutWidgetParams;
  config: CheckoutWidgetConfiguration;
};

export default function CheckoutWidget(props: CheckoutWidgetInputs) {
  const { config, checkout, params } = props;
  const { environment, publishableKey } = checkout.config;

  const [iframeURL, setIframeURL] = useState<string>();

  useEffect(() => {
    if (!publishableKey) return;

    const url = getIframeURL(params, config, environment, publishableKey);
    setIframeURL(url);
  }, [params, config, environment, publishableKey]);

  // TODO:
  // on iframe load error, go to error view 500
  // on iframe loading, show loading view, requires iframe to trigger an initialised event

  if (!iframeURL) {
    return null;
  }

  return (
    <Box
      rc={<iframe id="checkout-app" src={iframeURL} title="checkout" />}
      sx={{
        w: '100%',
        h: '100%',
        border: 'none',
        boxShadow: 'none',
      }}
    />
  );
}
