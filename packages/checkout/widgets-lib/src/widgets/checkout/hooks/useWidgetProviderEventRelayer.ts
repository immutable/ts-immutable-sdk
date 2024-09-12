import { PostMessageHandlerEventType } from '@imtbl/checkout-sdk';
import { useCallback, useEffect } from 'react';
import { useCheckoutContext } from '../context/CheckoutContextProvider';

export function useWidgetProviderEventRelayer() {
  const [checkoutState] = useCheckoutContext();
  const { postMessageHandler } = checkoutState;

  const onWidgetProviderEvent = useCallback(() => {
    postMessageHandler?.send(PostMessageHandlerEventType.WIDGET_PROVIDER_EVENT, {});
  }, [postMessageHandler]);

  useEffect(
    () => {
      if (!postMessageHandler) return () => { };

      window.addEventListener(PostMessageHandlerEventType.WIDGET_PROVIDER_EVENT, onWidgetProviderEvent);

      return () => window.removeEventListener(PostMessageHandlerEventType.WIDGET_PROVIDER_EVENT, onWidgetProviderEvent);
    },
    [postMessageHandler, onWidgetProviderEvent],
  );
}
