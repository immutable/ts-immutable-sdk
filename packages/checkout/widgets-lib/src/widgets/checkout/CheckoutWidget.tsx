import { Environment } from '@imtbl/config';
import { CheckoutFlowType, CheckoutWidgetParams, Checkout } from '@imtbl/checkout-sdk';
import { useEffect, useState } from 'react';
import { Box } from '@biom3/react';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { CHECKOUT_APP_URL } from '../../lib/constants';

export type CheckoutWidgetInputs = {
  checkout: Checkout;
  config: StrongCheckoutWidgetsConfig;
  params: CheckoutWidgetParams;
};

const getQueryParamsByFlow = (flow: CheckoutFlowType) => `?flow=${flow}`;

const getIframeURL = (
  flow: CheckoutFlowType,
  environment: Environment,
  publishableKey: string,
  language: string,
): string => {
  // environment, flow, params, configs
  const baseUrl = CHECKOUT_APP_URL[environment];

  const queryParams = getQueryParamsByFlow(flow);

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
  const { language, flow } = params;
  const { environment } = config;
  const { publishableKey } = checkout.config;

  const [iframeURL, setIframeURL] = useState<string>();

  useEffect(() => {
    if (!publishableKey || !language) return;

    const url = getIframeURL(
      flow,
      environment,
      publishableKey,
      language,
    );

    setIframeURL(url);
  }, [publishableKey, language]);

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
