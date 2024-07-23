import { Environment } from '@imtbl/config';
import {
  CheckoutFlowType,
  CheckoutWidgetParams,
  Checkout,
} from '@imtbl/checkout-sdk';
import { useEffect, useState } from 'react';
import { Box } from '@biom3/react';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { CHECKOUT_APP_URL } from '../../lib/constants';

export type CheckoutWidgetInputs = {
  checkout: Checkout;
  config: StrongCheckoutWidgetsConfig;
  params: CheckoutWidgetParams;
};

const getIframeURL = (
  params: CheckoutWidgetInputs['params'],
  environment: Environment,
  publishableKey: string,
): string => {
  const { language, flow, ...restParams } = params;
  // environment, flow, params, configs
  const baseUrl = CHECKOUT_APP_URL[environment];

  const queryParams = new URLSearchParams(
    restParams as Record<string, string>,
  ).toString();

  console.log('🐛 ~ queryParams:', queryParams);

  switch (flow) {
    case CheckoutFlowType.CONNECT:
      return `${baseUrl}/${publishableKey}/${language}/connect?${queryParams}`;
    case CheckoutFlowType.WALLET:
      return `${baseUrl}/${publishableKey}/${language}/wallet?${queryParams}`;
    default:
      return baseUrl;
  }
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
