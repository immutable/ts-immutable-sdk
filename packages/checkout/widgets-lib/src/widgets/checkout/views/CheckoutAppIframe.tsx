import { Box } from '@biom3/react';
import { useTranslation } from 'react-i18next';
import {
  useContext, useEffect, useRef, useState,
} from 'react';
import {
  CheckoutEventType, IMTBLWidgetEvents,
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
import {
  IFRAME_INIT_TIMEOUT_MS,
  IFRAME_ALLOW_PERMISSIONS,
} from '../utils/config';
import { useEip6963Relayer } from '../hooks/useEip6963Relayer';
import { useProviderRelay } from '../hooks/useProviderRelay';

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

  useEip6963Relayer();
  useProviderRelay();

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
    // TODO: Move to its own hook
    postMessageHandler.subscribe(({ type, payload }) => {
      if (type !== PostMessageHandlerEventType.WIDGET_EVENT) return;

      // FIXME: improve typing
      const customEvent: {
        type: IMTBLWidgetEvents.IMTBL_CHECKOUT_WIDGET_EVENT;
        detail: {
          type: CheckoutEventType;
          data: WidgetEventData[WidgetType.CHECKOUT][keyof WidgetEventData[WidgetType.CHECKOUT]];
        };
      } = payload as any;

      // TODO: intercept connect success and inject the state provider
      // FIXME: events type narrowing is not working properly
      if (customEvent.detail.type === CheckoutEventType.DISCONNECTED) {
        checkoutDispatch({
          payload: {
            type: CheckoutActions.SET_PROVIDER,
            provider: undefined,
          },
        });
      }

      // Forward widget events
      sendCheckoutEvent(eventTarget, customEvent.detail);

      // If iframe has been initialised, set widget as initialised
      if (customEvent.detail.type === CheckoutEventType.INITIALISED) {
        setInitialised(true);
        clearTimeout(timeoutRef.current!);
      }
    });

    // Expire iframe initialisation after timeout
    // and set a loading error
    timeoutRef.current = setTimeout(() => {
      if (!initialised) {
        setLoadingError(true);
        clearTimeout(timeoutRef.current!);
      }
    }, IFRAME_INIT_TIMEOUT_MS);

    return () => {
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
              loading="lazy"
              ref={iframeRef}
              src={iframeURL}
              onLoad={onIframeLoad}
              allow={IFRAME_ALLOW_PERMISSIONS}
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
