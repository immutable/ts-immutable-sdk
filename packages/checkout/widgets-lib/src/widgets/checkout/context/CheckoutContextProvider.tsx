import {
  Dispatch, ReactNode, useContext,
} from 'react';
import {
  CheckoutAction,
  CheckoutContext,
  CheckoutState,
} from './CheckoutContext';

type CheckoutContextProviderProps = {
  values: {
    checkoutState: CheckoutState;
    checkoutDispatch: Dispatch<CheckoutAction>;
  };
  children: ReactNode;
};
export function CheckoutContextProvider({
  values,
  children,
}: CheckoutContextProviderProps) {
  return (
    <CheckoutContext.Provider value={values}>
      {children}
    </CheckoutContext.Provider>
  );
}

export const useCheckoutContext = () => {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    const error = new Error(
      'useCheckoutContext must be used within a <CheckoutContextProvider />',
    );
    throw error;
  }

  return [context.checkoutState, context.checkoutDispatch] as const;
};
