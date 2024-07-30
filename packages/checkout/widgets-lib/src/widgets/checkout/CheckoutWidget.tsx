/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Checkout,
  CheckoutFlowType,
  CheckoutWidgetParams,
  WalletProviderName,
} from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import {
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { Box } from '@biom3/react';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import {
  CheckoutActions, CheckoutContext,
  checkoutReducer,
  initialCheckoutState,
} from './context/CheckoutContext';
import { CheckoutContextProvider, useCheckoutContext } from './context/CheckoutContextProvider';
import { CheckoutAppIframe } from './views/CheckoutAppIframe';
// import { CHECKOUT_APP_URL } from '../../lib/constants';

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
  // const baseUrl = CHECKOUT_APP_URL[environment];
  const baseUrl = 'http://localhost:3001';

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
  // const [checkoutState, checkoutDispatch] = useCheckoutContext();

  const [checkoutState, checkoutDispatch] = useReducer(checkoutReducer, initialCheckoutState);
  const checkoutReducerValues = useMemo(
    () => ({ checkoutState, checkoutDispatch }),
    [checkoutState, checkoutDispatch],
  );

  useEffect(() => {
    if (!publishableKey || !params.language) return;

    const iframeUrl = getIframeURL(params, environment, publishableKey);

    // setIframeURL(iframeUrl);

    console.log('@@@@ CheckoutWidget iframeUrl', iframeUrl);

    checkoutDispatch({
      payload: {
        type: CheckoutActions.SET_IFRAME_URL,
        iframeUrl,
      },
    });
  }, [publishableKey, params]);

  useEffect(() => {
    checkoutDispatch({
      payload: {
        type: CheckoutActions.SET_CHECKOUT,
        checkout,
      },
    });

    const connectProvider = async () => {
      console.log('@@@@@ connectProvider()');
      const createProviderResult = await checkout.createProvider({ walletProviderName: WalletProviderName.METAMASK });

      const connectResult = await checkout.connect({ provider: createProviderResult.provider });

      checkoutDispatch({
        payload: {
          type: CheckoutActions.SET_PROVIDER,
          provider: connectResult.provider,
        },
      });
    };

    connectProvider();
  }, [checkout]);

  // const onIframeLoad = () => {
  //   if (!iframeRef.current?.contentWindow) return;

  //   const postMessageHandler = new PostMessageHandler({
  //     targetOrigin: iframeURL!,
  //     eventTarget: iframeRef.current.contentWindow,
  //   });

  //   // postMessageHandler.

  //   //  register providerRelay with it
  // };

  // TODO:
  // on iframe load error, go to error view 500
  // on iframe loading, show loading view, requires iframe to trigger an initialised event

  // if (!iframeURL) {
  //   return null;
  // }

  return (
    // <Box>
    //   Hello World
    // </Box>
    <CheckoutContextProvider values={checkoutReducerValues}>
      CheckoutWidgetComponent
      <CheckoutAppIframe />
    </CheckoutContextProvider>
  );
}
