import { Box } from '@biom3/react';
import {
  CheckoutEventType,
} from '@imtbl/checkout-sdk';
import {
  useContext,
  useRef, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { ErrorView } from '../../../views/error/ErrorView';
import { LoadingView } from '../../../views/loading/LoadingView';
import { sendCheckoutEvent } from '../CheckoutWidgetEvents';
import { CheckoutActions } from '../context/CheckoutContext';
import { useCheckoutContext } from '../context/CheckoutContextProvider';
import { useCheckoutEventsRelayer } from '../hooks/useCheckoutEventsRelayer';
import { useEip6963Relayer } from '../hooks/useEip6963Relayer';
import { useProviderRelay } from '../hooks/useProviderRelay';
import {
  IFRAME_ALLOW_PERMISSIONS,
} from '../utils/config';

export interface LoadingHandoverProps {
  text: string;
  duration?: number;
  animationUrl: string;
  inputValue?: number;
}
export function CheckoutAppIframe() {
  const { t } = useTranslation();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loadingError, setLoadingError] = useState<boolean>(false);
  const [
    {
      iframeURL, iframeContentWindow, initialised,
    },
    checkoutDispatch,
  ] = useCheckoutContext();

  useCheckoutEventsRelayer();
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
