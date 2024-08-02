import { Box } from '@biom3/react';
import { useContext, useEffect, useRef } from 'react';
import {
  CheckoutEventType,
  IMTBLWidgetEvents,
  PostMessageHandlerEventType,
} from '@imtbl/checkout-sdk';
import { CheckoutActions } from '../context/CheckoutContext';
import { useCheckoutContext } from '../context/CheckoutContextProvider';
import { sendCheckoutEvent } from '../CheckoutWidgetEvents';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';

export interface LoadingHandoverProps {
  text: string;
  duration?: number;
  animationUrl: string;
  inputValue?: number;
}
export function CheckoutAppIframe() {
  const [checkoutState, checkoutDispatch] = useCheckoutContext();
  const { iframeUrl, postMessageHandler } = checkoutState;
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);

  const onIframeLoad = () => {
    if (!iframeRef.current?.contentWindow) {
      return;
    }

    checkoutDispatch({
      payload: {
        type: CheckoutActions.SET_CHECKOUT_APP_IFRAME,
        checkoutAppIframe: iframeRef.current.contentWindow,
      },
    });
  };

  useEffect(() => {
    if (postMessageHandler === undefined) return () => {};

    postMessageHandler.addEventHandler(
      PostMessageHandlerEventType.WIDGET_EVENT,
      (event: {
        type: IMTBLWidgetEvents;
        detail: {
          type: CheckoutEventType;
          data: Record<string, unknown>;
        };
      }) => {
        sendCheckoutEvent(eventTarget, event.detail);
      },
    );
    return () => {
      postMessageHandler.destroy();
    };
  }, [postMessageHandler]);

  if (!iframeUrl) {
    return null;
  }

  return (
    <Box
      rc={(
        <iframe
          id="checkout-app"
          title="checkout"
          ref={iframeRef}
          src={iframeUrl}
          onLoad={onIframeLoad}
        />
      )}
      sx={{
        w: '100%',
        h: '100%',
        border: 'none',
        boxShadow: 'none',
      }}
    />
  );
}
