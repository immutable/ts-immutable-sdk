import { useCallback, useEffect } from 'react';
import { EIP6963ProviderDetail, PostMessageHandlerEventType } from '@imtbl/checkout-sdk';
import { useCheckoutContext } from '../context/CheckoutContextProvider';

export function useEip6963Relayer() {
  const [checkoutState] = useCheckoutContext();
  const { postMessageHandler } = checkoutState;

  const onAnnounce = useCallback((event: CustomEvent<EIP6963ProviderDetail>) => {
    postMessageHandler?.send(PostMessageHandlerEventType.EIP_6963_EVENT, {
      message: 'eip6963:announceProvider',
      info: event.detail.info,
    });
  }, [postMessageHandler]);

  useEffect(
    () => {
      if (!postMessageHandler) return () => { };

      window.addEventListener('eip6963:announceProvider', onAnnounce as any);

      return () => window.removeEventListener('eip6963:announceProvider', onAnnounce as any);
    },
    [postMessageHandler, onAnnounce],
  );

  const onRequest = useCallback((payload: any) => {
    if (payload.message !== 'eip6963:requestProvider') return;

    window.dispatchEvent(new CustomEvent('eip6963:requestProvider'));
  }, [postMessageHandler]);

  useEffect(() => {
    if (!postMessageHandler) return;

    postMessageHandler.subscribe((message) => {
      if (message.type === PostMessageHandlerEventType.EIP_6963_EVENT) {
        onRequest(message.payload);
      }
    });
  }, [postMessageHandler, onRequest]);
}
