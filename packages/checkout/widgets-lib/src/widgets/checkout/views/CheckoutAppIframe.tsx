import { Box } from '@biom3/react';
import { useTranslation } from 'react-i18next';
import {
  useContext, useEffect, useRef, useState,
} from 'react';
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
import { LoadingView } from '../../../views/loading/LoadingView';

export interface LoadingHandoverProps {
  text: string;
  duration?: number;
  animationUrl: string;
  inputValue?: number;
}
export function CheckoutAppIframe() {
  const { t } = useTranslation();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loadingError] = useState<boolean>(false);
  const [
    { iframeURL, postMessageHandler, iframeContentWindow },
    checkoutDispatch,
  ] = useCheckoutContext();

  const loading = !iframeURL || !iframeContentWindow;

  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);

  const onIframeLoad = () => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) {
      return;
    }

    checkoutDispatch({
      payload: {
        type: CheckoutActions.SET_CHECKOUT_APP_IFRAME,
        iframeContentWindow: iframe.contentWindow,
      },
    });

    // TODO:
    // subscribe to post message initialised event
    // if not sent after timeout, setLoadingError(true)
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

  if (loadingError) {
    // TODO: Return error view
    return 'Error loading iframe';
  }

  return (
    <>
      {loading && <LoadingView loadingText={t('views.LOADING_VIEW.text')} />}
      {iframeURL && (
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
      )}
    </>
  );
}
