import { useEffect, useMemo, useReducer } from 'react';
import {
  Checkout,
  CheckoutWidgetConfiguration,
  CheckoutWidgetParams,
} from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import {
  CheckoutActions,
  checkoutReducer,
  initialCheckoutState,
} from './context/CheckoutContext';
import { CheckoutContextProvider } from './context/CheckoutContextProvider';
import { CheckoutAppIframe } from './views/CheckoutAppIframe';
import { getIframeURL } from './functions/iframeParams';

export type CheckoutWidgetInputs = {
  checkout: Checkout;
  params: CheckoutWidgetParams;
  config: CheckoutWidgetConfiguration;
  provider?: Web3Provider
};

export default function CheckoutWidget(props: CheckoutWidgetInputs) {
  const {
    config, checkout, params, provider,
  } = props;
  const { environment, publishableKey } = checkout.config;

  const [, iframeURL] = useMemo(() => {
    if (!publishableKey) return ['', ''];
    return getIframeURL(params, config, environment, publishableKey);
  }, [params, config, environment, publishableKey]);

  const [checkoutState, checkoutDispatch] = useReducer(
    checkoutReducer,
    initialCheckoutState,
  );
  const checkoutReducerValues = useMemo(
    () => ({
      checkoutState: {
        ...checkoutState, iframeURL, checkout,
      },
      checkoutDispatch,
    }),
    [checkoutState, checkoutDispatch, iframeURL, checkout],
  );

  useEffect(() => {
    checkoutDispatch({
      payload: {
        type: CheckoutActions.SET_PROVIDER,
        provider,
      },
    });
  }, [provider]);

  return (
    <CheckoutContextProvider values={checkoutReducerValues}>
      <CheckoutAppIframe />
    </CheckoutContextProvider>
  );
}
