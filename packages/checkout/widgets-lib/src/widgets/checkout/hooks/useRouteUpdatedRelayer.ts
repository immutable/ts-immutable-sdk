import { useEffect, useRef } from 'react';
import { useCheckoutContext } from '../context/CheckoutContextProvider';
import { CheckoutActions } from '../context/CheckoutContext';

export const useRouteUpdatedRelayer = () => {
  const [{ postMessageHandler }, checkoutDispatch] = useCheckoutContext();
  const unsubscribePostMessageHandler = useRef<() => void>();

  useEffect(() => {
    if (!postMessageHandler) return;
    unsubscribePostMessageHandler.current?.();
    unsubscribePostMessageHandler.current = postMessageHandler?.subscribe(({ type, payload }) => {
      if (type !== 'IMTBL_ROUTE_UPDATED' as any) return;

      checkoutDispatch({
        payload: {
          type: CheckoutActions.SET_CHECKOUT_APP_ROUTE,
          checkoutAppRoute: payload.route,
        },
      });
    });
  }, [postMessageHandler]);
};
