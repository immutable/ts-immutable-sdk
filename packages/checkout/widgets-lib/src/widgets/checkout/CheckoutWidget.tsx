import { Environment } from '@imtbl/config';
import { CheckoutFlowType, CheckoutWidgetParams } from '@imtbl/checkout-sdk';
import { useContext } from 'react';
import { Box } from '@biom3/react';
import { ConnectLoaderContext } from '../../context/connect-loader-context/ConnectLoaderContext';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { CHECKOUT_APP_URL } from '../../lib/constants';

export type CheckoutWidgetInputs = CheckoutWidgetParams & {
  config: StrongCheckoutWidgetsConfig;
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
  const { config, language, flow } = props;
  const { environment } = config;

  const { connectLoaderState: { checkout } } = useContext(ConnectLoaderContext);

  // TODO:
  // on iframe load error, go to error view 500
  // on iframe loading, show loading view, requires iframe to trigger an initialised event

  const iframeURL = getIframeURL(
    flow,
    environment,
    checkout?.config.publishableKey!,
    language!,
  );

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
