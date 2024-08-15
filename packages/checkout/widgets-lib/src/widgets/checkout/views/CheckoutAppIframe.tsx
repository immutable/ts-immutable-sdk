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
import { ErrorView } from '../../../views/error/ErrorView';
import { IFRAME_INIT_TIMEOUT_MS } from '../utils/config';

const permissions = `
  accelerometer;
  camera;
  microphone;
  geolocation;
  gyroscope;
  fullscreen;
  autoplay;
  encrypted-media;
  picture-in-picture;
  clipboard-write;
  clipboard-read;
`;
export interface LoadingHandoverProps {
  text: string;
  duration?: number;
  animationUrl: string;
  inputValue?: number;
}
export function CheckoutAppIframe() {
  const { t } = useTranslation();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [loadingError, setLoadingError] = useState<boolean>(false);
  const [initialised, setInitialised] = useState<boolean>(false);
  const [
    { iframeURL, postMessageHandler, iframeContentWindow },
    checkoutDispatch,
  ] = useCheckoutContext();

  const loading = !iframeURL || !iframeContentWindow || !initialised;

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
  };

  useEffect(() => {
    if (!postMessageHandler) return undefined;

    // subscribe to widget events
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

      // forward events
      sendCheckoutEvent(eventTarget, event.detail);

      // check if the widget has been initialised
      if (event.detail.type === CheckoutEventType.INITIALISED) {
        setInitialised(true);
        clearTimeout(timeoutRef.current!);
      }
    });

    // check if loaded correctly
    timeoutRef.current = setTimeout(() => {
      if (!initialised) {
        setLoadingError(true);
        clearTimeout(timeoutRef.current!);
      }
    }, IFRAME_INIT_TIMEOUT_MS);

    return () => {
      postMessageHandler.destroy();
      clearTimeout(timeoutRef.current!);
    };
  }, [postMessageHandler]);

  if (loadingError) {
    return (
      <ErrorView
        onCloseClick={() => {
          sendCheckoutEvent(eventTarget, {
            type: CheckoutEventType.CLOSE,
            data: {},
          });
        }}
        onActionClick={() => {
          setLoadingError(false);
          iframeContentWindow?.location.reload();
        }}
        actionText={t('views.ERROR_VIEW.actionText')}
      />
    );
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
              allow={permissions.trim().replace(/\n/g, '')}
              loading="lazy"
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
