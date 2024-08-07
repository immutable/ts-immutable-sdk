import { PostMessageHandler } from '@imtbl/checkout-sdk';
import {
  Dispatch, ReactNode, useContext, useEffect,
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
    checkoutState: CheckoutState;
    checkoutDispatch: Dispatch<CheckoutAction>;
  };
  children: ReactNode;
};
export function CheckoutContextProvider({
  values,
  children,
}: CheckoutContextProviderProps) {
  const { checkoutState, checkoutDispatch } = values;
  const {
    checkout,
    provider,
    iframeContentWindow,
    postMessageHandler,
    iframeURL,
  } = checkoutState;

  useEffect(() => {
    if (!iframeContentWindow || !checkout || !iframeURL) return;

    const postMessageHandlerInstance = new PostMessageHandler({
      targetOrigin: new URL(iframeURL).origin,
      eventTarget: iframeContentWindow,
    });

    // TODO: remove logger after done with development
    postMessageHandlerInstance.setLogger((...args: any[]) => {
      console.log("🔔 PARENT – ", ...args); // eslint-disable-line
    });

    checkoutDispatch({
      payload: {
        type: CheckoutActions.SET_POST_MESSAGE_HANDLER,
        postMessageHandler: postMessageHandlerInstance,
      },
    });
  }, [iframeContentWindow, checkout, iframeURL]);

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
