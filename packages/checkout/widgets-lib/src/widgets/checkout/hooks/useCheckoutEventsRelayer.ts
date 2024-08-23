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

  useEffect(() => {
    if (!postMessageHandler) return undefined;
    unsubscribePostMessageHandler.current?.();

    unsubscribePostMessageHandler.current = postMessageHandler.subscribe(({ type, payload }) => {
      if (type !== PostMessageHandlerEventType.WIDGET_EVENT || !isWidgetEvent(payload)) return;

      if (payload.detail.type === CheckoutEventType.SUCCESS
        && (payload.detail.data as CheckoutSuccessEvent).flow === CheckoutFlowType.CONNECT) {
        const checkoutConnectSuccessEvent = payload.detail as unknown as CheckoutConnectSuccessEvent;
        if (!provider) {
          throw new Error('Provider not found, unable to send checkout connect success event');
        }
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
        checkoutDispatch({
          payload: {
            type: CheckoutActions.SET_INITIALISED,
            initialised: true,
          },
        });
      }
    });

    return () => {
      unsubscribePostMessageHandler.current?.();
    };
  }, [postMessageHandler, checkoutDispatch, eventTarget, provider]);
}
