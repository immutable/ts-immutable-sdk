import { Box } from '@biom3/react';
import { useContext, useEffect, useRef } from 'react';
import {
  CheckoutEventType,
  IMTBLWidgetEvents,
  PostMessageHandlerEventType,
  WidgetEventData,
  WidgetType,
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
  const { iframeURL, postMessageHandler } = checkoutState;
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
        iframeContentWindow: iframeRef.current.contentWindow,
      },
    });
  };

  useEffect(() => {
    if (!postMessageHandler) return undefined;

    postMessageHandler.subscribe(({ type, payload }) => {
      // FIXME: improve typing
      const event: {
        type: IMTBLWidgetEvents.IMTBL_CHECKOUT_WIDGET_EVENT;
        detail: {
          type: CheckoutEventType;
          data: WidgetEventData[WidgetType.CHECKOUT][keyof WidgetEventData[WidgetType.CHECKOUT]];
        };
      } = payload as any;

      if (type !== PostMessageHandlerEventType.WIDGET_EVENT) return;

      sendCheckoutEvent(eventTarget, event.detail);
    });
    return () => {
      postMessageHandler.destroy();
    };
  }, [postMessageHandler]);

  if (!iframeURL) {
    return null;
  }

  return (
    <Box
      rc={(
        <iframe
          id="checkout-app"
          title="checkout"
          ref={iframeRef}
          src={iframeURL}
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
