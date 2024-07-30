import { PostMessageHandler } from '@imtbl/checkout-sdk';
import {
  Dispatch,
  ReactNode, useContext, useEffect,
} from 'react';
import {
  CheckoutAction,
  CheckoutActions,
  CheckoutContext,
  CheckoutState,
} from './CheckoutContext';
import { ProviderRelay } from './ProviderRelay';

type CheckoutContextProviderProps = {
  values: {
    checkoutState: CheckoutState,
    checkoutDispatch: Dispatch<CheckoutAction>,
  }, children: ReactNode
};
export function CheckoutContextProvider({ values, children }: CheckoutContextProviderProps) {
  const { checkoutState, checkoutDispatch } = values;

  const { provider, checkoutAppIframe, postMessageHandler } = checkoutState;

  useEffect(() => {
    if (!checkoutAppIframe) return;

    checkoutDispatch({
      payload: {
        type: CheckoutActions.SET_POST_MESSAGE_HANDLER,
        postMessageHandler: new PostMessageHandler({
          // TODO get the target origin from config
          targetOrigin: 'http://localhost:3001',
          eventTarget: checkoutAppIframe,
        }),
      },
    });
  }, [checkoutAppIframe]);

  useEffect(() => {
    if (!provider || !postMessageHandler) return;
    checkoutDispatch({
      payload: {
        type: CheckoutActions.SET_PROVIDER_RELAY,
        providerRelay: new ProviderRelay(postMessageHandler, provider),
      },
    });
  }, [provider, postMessageHandler]);

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
      'useCheckoutContext must be used within a <ImtblProvider />',
    );
    throw error;
  }

  return [context.checkoutState, context.checkoutDispatch] as const;
};
