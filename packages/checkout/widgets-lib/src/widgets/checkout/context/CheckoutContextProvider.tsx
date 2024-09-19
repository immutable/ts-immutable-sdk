import { ReactNode, useMemo, useReducer } from 'react';
import {
  CheckoutContext,
  checkoutReducer,
  initialCheckoutState,
} from './CheckoutContext';
import { useConnectLoaderState } from '../../../context/connect-loader-context/ConnectLoaderContext';

export const useCheckoutWidgetState = () => {
  const [viewState, viewDispatch] = useReducer(
    checkoutReducer,
    initialCheckoutState,
  );

  return [viewState, viewDispatch] as const;
};

type CheckoutContextProviderProps = {
  children: ReactNode;
};

export function CheckoutWidgetContextProvicer({
  children,
}: CheckoutContextProviderProps) {
  const [{ checkout, provider }] = useConnectLoaderState();
  const [checkoutState, checkoutDispatch] = useCheckoutWidgetState();

  const values = useMemo(
    () => ({
      checkoutState: { ...checkoutState, checkout, provider },
      checkoutDispatch,
    }),
    [checkoutState, checkoutDispatch, checkout, provider],
  );

  return (
    <CheckoutContext.Provider value={values}>
      {children}
    </CheckoutContext.Provider>
  );
}
