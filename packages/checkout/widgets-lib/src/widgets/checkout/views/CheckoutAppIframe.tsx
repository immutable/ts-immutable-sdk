import { Box } from '@biom3/react';
import {
  useRef,
} from 'react';
import { CheckoutActions } from '../context/CheckoutContext';
import { useCheckoutContext } from '../context/CheckoutContextProvider';

export interface LoadingHandoverProps {
  text: string;
  duration?: number;
  animationUrl: string;
  inputValue?: number;
}
export function CheckoutAppIframe() {
  const [checkoutState, checkoutDispatch] = useCheckoutContext();
  const {
    iframeUrl,
  } = checkoutState;
  const iframeRef = useRef<HTMLIFrameElement>(null);

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

  if (!iframeUrl) {
    return null;
  }

  return (
    <Box
      rc={(
        <iframe
          ref={iframeRef}
          onLoad={onIframeLoad}
          src={iframeUrl}
          title="checkout"
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
