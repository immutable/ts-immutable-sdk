import { PostMessageHandlerEventType } from '@imtbl/checkout-sdk';
import { useCallback, useEffect } from 'react';
import { baseWidgetProviderEvent } from '../../../lib';
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

      window.addEventListener(baseWidgetProviderEvent, onWidgetProviderEvent as any);

      return () => window.removeEventListener(baseWidgetProviderEvent, onWidgetProviderEvent as any);
    },
    [postMessageHandler, onWidgetProviderEvent],
  );
}
