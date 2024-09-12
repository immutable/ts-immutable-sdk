/* eslint-disable no-case-declarations */
import { useContext, useEffect, useRef } from 'react';
import {
  CheckoutEventType,
  PostMessageHandlerEventType,
  CheckoutSuccessEventType,
  CheckoutUserActionEventType,
} from '@imtbl/checkout-sdk';
import { useCheckoutContext } from '../context/CheckoutContextProvider';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { CheckoutActions } from '../context/CheckoutContext';
import { sendCheckoutEvent } from '../CheckoutWidgetEvents';

export function useCheckoutEventsRelayer() {
  const [{ postMessageHandler, provider }, checkoutDispatch] = useCheckoutContext();
  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);
  const unsubscribePostMessageHandler = useRef<(() => void) | undefined>();

  useEffect(() => {
    if (!postMessageHandler) return undefined;
    unsubscribePostMessageHandler.current?.();

    unsubscribePostMessageHandler.current = postMessageHandler.subscribe(
      ({ type, payload }) => {
        if (type !== PostMessageHandlerEventType.WIDGET_EVENT) {
          return;
        }

        const event = { ...payload };

        if (event.detail.type === CheckoutEventType.INITIALISED) {
          checkoutDispatch({
            payload: {
              type: CheckoutActions.SET_INITIALISED,
              initialised: true,
            },
          });
        }

        if (event.detail.type === CheckoutEventType.DISCONNECTED) {
          checkoutDispatch({
            payload: {
              type: CheckoutActions.SET_PROVIDER,
              provider: undefined,
            },
          });
        }

        if (
          event.detail.type === CheckoutEventType.SUCCESS
          && event.detail.data.type === CheckoutSuccessEventType.CONNECT_SUCCESS
        ) {
          if (!provider) {
            throw new Error(
              'Provider not found, unable to send checkout connect success event',
            );
          }

          event.detail.data.data.provider = provider;
        }

        if (
          event.detail.type === CheckoutEventType.USER_ACTION
          && event.detail.data.type === CheckoutUserActionEventType.NETWORK_SWITCH
        ) {
          if (!provider) {
            throw new Error(
              'Provider not found, unable to send checkout network switch',
            );
          }

          postMessageHandler?.send(PostMessageHandlerEventType.PROVIDER_UPDATED, {
            isMetamask: provider.provider.isMetaMask,
            isPassport: (provider.provider as any)?.isPassport,
          });

          // TODO - causes SON.stringify in checkout.tsx to break
          // event.detail.data.data.provider = provider;
        }

        sendCheckoutEvent(eventTarget, event.detail);
      },
    );

    return () => {
      unsubscribePostMessageHandler.current?.();
    };
  }, [postMessageHandler, checkoutDispatch, eventTarget, provider]);
}
