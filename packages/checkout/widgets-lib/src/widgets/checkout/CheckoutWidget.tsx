import {
  Checkout,
  CheckoutFlowType,
  CheckoutWidgetParams,
  WalletProviderName,
} from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import {
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import {
  CheckoutActions,
  checkoutReducer,
  initialCheckoutState,
} from './context/CheckoutContext';
import { CheckoutContextProvider } from './context/CheckoutContextProvider';
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
  // TODO get baseUrl from config/params
  // environment, flow, params, configs
  // const baseUrl = CHECKOUT_APP_URL[environment];
  const baseUrl = 'http://localhost:3001';

  const queryParams = new URLSearchParams(
    restParams as Record<string, string>,
  ).toString();

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

  const [checkoutState, checkoutDispatch] = useReducer(checkoutReducer, initialCheckoutState);
  const checkoutReducerValues = useMemo(
    () => ({ checkoutState, checkoutDispatch }),
    [checkoutState, checkoutDispatch],
  );

  useEffect(() => {
    if (!publishableKey || !params.language) return;

    const iframeUrl = getIframeURL(params, environment, publishableKey);

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

  return (
    <CheckoutContextProvider values={checkoutReducerValues}>
      CheckoutWidgetComponent
      <CheckoutAppIframe />
    </CheckoutContextProvider>
  );
}
