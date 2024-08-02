import { useEffect, useMemo, useReducer } from 'react';
import {
  Checkout,
  CheckoutWidgetConfiguration,
  CheckoutWidgetParams,
  WalletProviderName,
} from '@imtbl/checkout-sdk';
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
};

export default function CheckoutWidget(props: CheckoutWidgetInputs) {
  const { config, checkout, params } = props;
  const { environment, publishableKey } = checkout.config;

  const [, iframeUrl] = useMemo(() => {
    if (!publishableKey) return ['', ''];
    return getIframeURL(params, config, environment, publishableKey);
  }, [params, config, environment, publishableKey]);

  const [checkoutState, checkoutDispatch] = useReducer(
    checkoutReducer,
    initialCheckoutState,
  );
  const checkoutReducerValues = useMemo(
    () => ({ checkoutState, checkoutDispatch }),
    [checkoutState, checkoutDispatch],
  );

  useEffect(() => {
    if (iframeUrl === undefined) return;

    checkoutDispatch({
      payload: {
        type: CheckoutActions.SET_IFRAME_URL,
        iframeUrl,
      },
    });
  }, [iframeUrl]);

  useEffect(() => {
    checkoutDispatch({
      payload: {
        type: CheckoutActions.SET_CHECKOUT,
        checkout,
      },
    });

    const connectProvider = async () => {
      const createProviderResult = await checkout.createProvider({
        walletProviderName: WalletProviderName.METAMASK,
      });

      const connectResult = await checkout.connect({
        provider: createProviderResult.provider,
      });

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
      <CheckoutAppIframe />
    </CheckoutContextProvider>
  );
}
