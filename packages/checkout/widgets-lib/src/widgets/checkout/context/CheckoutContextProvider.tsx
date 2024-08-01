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
import { CHECKOUT_APP_URL } from '../../../lib';

type CheckoutContextProviderProps = {
  values: {
    checkoutState: CheckoutState,
    checkoutDispatch: Dispatch<CheckoutAction>,
  }, children: ReactNode
};
export function CheckoutContextProvider({ values, children }: CheckoutContextProviderProps) {
  const { checkoutState, checkoutDispatch } = values;
  const { checkout } = checkoutState;
  const { provider, checkoutAppIframe, postMessageHandler } = checkoutState;

  useEffect(() => {
    if (!checkoutAppIframe || !checkout) return;

    checkoutDispatch({
      payload: {
        type: CheckoutActions.SET_POST_MESSAGE_HANDLER,
        postMessageHandler: new PostMessageHandler({
          targetOrigin: CHECKOUT_APP_URL[checkout.config.environment],
          eventTarget: checkoutAppIframe,
        }),
      },
    });
  }, [checkoutAppIframe, checkout]);

  useEffect(() => {
    if (!provider || !postMessageHandler) return undefined;
    checkoutDispatch({
      payload: {
        type: CheckoutActions.SET_PROVIDER_RELAY,
        providerRelay: new ProviderRelay(postMessageHandler, provider),
      },
    });

    return () => {
      postMessageHandler?.destroy();
    };
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
