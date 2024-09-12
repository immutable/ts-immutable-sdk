import { useEffect, useMemo, useReducer } from 'react';
import {
  Checkout,
  CheckoutWidgetConfiguration,
  CheckoutWidgetParams,
  PostMessageHandlerEventType,
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
import { useMount } from './hooks/useMount';
import { useAsyncMemo } from './hooks/useAsyncMemo';

export type CheckoutWidgetInputs = {
  checkout: Checkout;
  params: CheckoutWidgetParams;
  config: CheckoutWidgetConfiguration;
  provider?: Web3Provider;
};

export default function CheckoutWidget(props: CheckoutWidgetInputs) {
  const {
    config, checkout, params, provider,
  } = props;

  const iframeURL = useAsyncMemo(
    async () => getIframeURL(params, config, checkout.config),
    [params, config, checkout.config],
  );

  const [checkoutState, checkoutDispatch] = useReducer(
    checkoutReducer,
    initialCheckoutState,
  );
  const checkoutReducerValues = useMemo(
    () => ({
      checkoutState: { ...checkoutState, iframeURL, checkout },
      checkoutDispatch,
    }),
    [checkoutState, checkoutDispatch, iframeURL, checkout],
  );

  // If the widget was initialized with a provider,
  // notify iframe via postMessage
  const { postMessageHandler } = checkoutState;
  useMount(
    () => {
      if (!provider) return;

      postMessageHandler?.send(PostMessageHandlerEventType.PROVIDER_UPDATED, {
        isMetamask: provider.provider.isMetaMask,
        isPassport: (provider.provider as any)?.isPassport,
      });
    },
    [postMessageHandler, provider] as const,
    ([_postMessageHandler]) => _postMessageHandler !== undefined,
  );

  // keep the provider updated in the state
  useEffect(() => {
    checkoutDispatch({
      payload: { type: CheckoutActions.SET_PROVIDER, provider },
    });
  }, [provider]);

  return (
    <CheckoutContextProvider values={checkoutReducerValues}>
      <CheckoutAppIframe />
    </CheckoutContextProvider>
  );
}
