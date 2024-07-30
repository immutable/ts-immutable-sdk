import { Box } from '@biom3/react';
import { PostMessageHandler } from '@imtbl/checkout-sdk';
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

    // TODO get targetOrigin from config/params
    checkoutDispatch({
      payload: {
        type: CheckoutActions.SET_POST_MESSAGE_HANDLER,
        postMessageHandler: new PostMessageHandler({
          targetOrigin: 'http://localhost:3001',
          eventTarget: iframeRef.current.contentWindow,
        }),
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
