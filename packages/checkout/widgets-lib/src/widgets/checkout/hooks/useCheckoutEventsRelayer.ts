import { useContext, useEffect, useRef } from 'react';
import {
  CheckoutConnectSuccessEvent,
  CheckoutEventType,
  CheckoutFlowType,
  CheckoutSuccessEvent,
  IMTBLWidgetEvents,
  PostMessageHandlerEventType,
  WidgetEventData,
  WidgetType,
} from '@imtbl/checkout-sdk';
import { useCheckoutContext } from '../context/CheckoutContextProvider';
import { sendCheckoutEvent } from '../CheckoutWidgetEvents';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { IFRAME_INIT_TIMEOUT_MS } from '../utils/config';
import { CheckoutActions } from '../context/CheckoutContext';

function isWidgetEvent(payload: any): payload is {
  type: IMTBLWidgetEvents.IMTBL_CHECKOUT_WIDGET_EVENT;
  detail: {
    type: CheckoutEventType;
    data: WidgetEventData[WidgetType.CHECKOUT][keyof WidgetEventData[WidgetType.CHECKOUT]];
  };
} {
  return payload.type === IMTBLWidgetEvents.IMTBL_CHECKOUT_WIDGET_EVENT;
}

export function useCheckoutEventsRelayer() {
  const [{ postMessageHandler, provider }, checkoutDispatch] = useCheckoutContext();
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);
  const unsubscribePostMessageHandler = useRef<(() => void) | undefined>();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!postMessageHandler) return undefined;
    unsubscribePostMessageHandler.current?.();

    unsubscribePostMessageHandler.current = postMessageHandler.subscribe(({ type, payload }) => {
      if (type !== PostMessageHandlerEventType.WIDGET_EVENT || !isWidgetEvent(payload)) return;

      if (payload.detail.type === CheckoutEventType.SUCCESS
        && (payload.detail.data as CheckoutSuccessEvent).flow === CheckoutFlowType.CONNECT) {
        const checkoutConnectSuccessEvent = payload.detail as unknown as CheckoutConnectSuccessEvent;
        if (!provider) return;
        checkoutConnectSuccessEvent.data.provider = provider;
        sendCheckoutEvent(eventTarget, { type: payload.detail.type, data: checkoutConnectSuccessEvent });
        return;
      }

      if (payload.detail.type === CheckoutEventType.DISCONNECTED) {
        checkoutDispatch({
          payload: {
            type: CheckoutActions.SET_PROVIDER,
            provider: undefined,
          },
        });
      }

      sendCheckoutEvent(eventTarget, payload.detail);

      if (payload.detail.type === CheckoutEventType.INITIALISED) {
        clearTimeout(timeoutRef.current!);
        checkoutDispatch({
          payload: {
            type: CheckoutActions.SET_INITIALISED,
            initialised: true,
          },
        });
      }
    });

    timeoutRef.current = setTimeout(() => {
      clearTimeout(timeoutRef.current!);
    }, IFRAME_INIT_TIMEOUT_MS);

    return () => {
      clearTimeout(timeoutRef.current!);
      unsubscribePostMessageHandler.current?.();
    };
  }, [postMessageHandler, checkoutDispatch, eventTarget, provider]);
}
