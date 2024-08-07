import { Web3Provider } from '@ethersproject/providers';
import { createContext } from 'react';
import {
  Checkout, EIP6963ProviderInfo, PostMessageHandler, WalletProviderName,
} from '@imtbl/checkout-sdk';
import { Passport } from '@imtbl/passport';
import { ProviderRelay } from './ProviderRelay';

export interface CheckoutState {
  checkout: Checkout | null;
  provider: Web3Provider | undefined;
  passport: Passport | undefined;
  iframeURL: string | undefined;
  iframeContentWindow: Window | undefined;
  postMessageHandler: PostMessageHandler | undefined;
  providerRelay: ProviderRelay | undefined;
  walletProviderName: WalletProviderName | null;
  walletProviderInfo: EIP6963ProviderInfo | null;
  sendCloseEvent: () => void;
}

export const initialCheckoutState: CheckoutState = {
  checkout: null,
  provider: undefined,
  passport: undefined,
  iframeURL: undefined,
  iframeContentWindow: undefined,
  postMessageHandler: undefined,
  providerRelay: undefined,
  walletProviderInfo: null,
  walletProviderName: null,
  sendCloseEvent: () => { },
};

export interface CheckoutContextState {
  checkoutState: CheckoutState;
  checkoutDispatch: React.Dispatch<CheckoutAction>;
}

export interface CheckoutAction {
  payload: ActionPayload;
}

type ActionPayload =
  | SetCheckoutPayload
  | SetProviderPayload
  | SetIframeURLPayload
  | SetPostMessageHandlerPayload
  | SetIframeContentWindowPayload
  | SetProviderRelayPayload
  | SetPassportPayload
  | SetProviderNamePayload
  | SetSendCloseEventPayload;

export enum CheckoutActions {
  SET_CHECKOUT = 'SET_CHECKOUT',
  SET_PROVIDER = 'SET_PROVIDER',
  SET_IFRAME_URL = 'SET_IFRAME_URL',
  SET_POST_MESSAGE_HANDLER = 'SET_POST_MESSAGE_HANDLER',
  SET_CHECKOUT_APP_IFRAME = 'SET_CHECKOUT_APP_IFRAME',
  SET_PROVIDER_RELAY = 'SET_PROVIDER_RELAY',
  SET_PASSPORT = 'SET_PASSPORT',
  SET_WALLET_PROVIDER_NAME = 'SET_WALLET_PROVIDER_NAME',
  SET_SEND_CLOSE_EVENT = 'SET_SEND_CLOSE_EVENT',
}

export interface SetCheckoutPayload {
  type: CheckoutActions.SET_CHECKOUT;
  checkout: Checkout;
}

export interface SetProviderPayload {
  type: CheckoutActions.SET_PROVIDER;
  provider: Web3Provider;
}

export interface SetIframeURLPayload {
  type: CheckoutActions.SET_IFRAME_URL;
  iframeURL: string;
}

export interface SetIframeContentWindowPayload {
  type: CheckoutActions.SET_CHECKOUT_APP_IFRAME;
  iframeContentWindow: Window;
}

export interface SetPostMessageHandlerPayload {
  type: CheckoutActions.SET_POST_MESSAGE_HANDLER;
  postMessageHandler: PostMessageHandler;
}

export interface SetProviderRelayPayload {
  type: CheckoutActions.SET_PROVIDER_RELAY;
  providerRelay: ProviderRelay;
}

export interface SetPassportPayload {
  type: CheckoutActions.SET_PASSPORT;
  passport: Passport;
}

export interface SetProviderNamePayload {
  type: CheckoutActions.SET_WALLET_PROVIDER_NAME;
  walletProviderName: WalletProviderName;
}

export interface SetSendCloseEventPayload {
  type: CheckoutActions.SET_SEND_CLOSE_EVENT;
  sendCloseEvent: () => void;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const CheckoutContext = createContext<CheckoutContextState>({
  checkoutState: initialCheckoutState,
  checkoutDispatch: () => { },
});

CheckoutContext.displayName = 'CheckoutContext'; // help with debugging Context in browser

export type Reducer<S, A> = (prevState: S, action: A) => S;

export const checkoutReducer: Reducer<CheckoutState, CheckoutAction> = (
  state: CheckoutState,
  action: CheckoutAction,
) => {
  switch (action.payload.type) {
    case CheckoutActions.SET_CHECKOUT:
      return {
        ...state,
        checkout: action.payload.checkout,
      };
    case CheckoutActions.SET_PROVIDER:
      return {
        ...state,
        provider: action.payload.provider,
      };
    case CheckoutActions.SET_PASSPORT:
      return {
        ...state,
        passport: action.payload.passport,
      };
    case CheckoutActions.SET_IFRAME_URL:
      return {
        ...state,
        iframeURL: action.payload.iframeURL,
      };
    case CheckoutActions.SET_CHECKOUT_APP_IFRAME:
      return {
        ...state,
        iframeContentWindow: action.payload.iframeContentWindow,
      };
    case CheckoutActions.SET_POST_MESSAGE_HANDLER:
      return {
        ...state,
        postMessageHandler: action.payload.postMessageHandler,
      };
    case CheckoutActions.SET_PROVIDER_RELAY:
      return {
        ...state,
        providerRelay: action.payload.providerRelay,
      };
    case CheckoutActions.SET_WALLET_PROVIDER_NAME:
      return {
        ...state,
        walletProviderName: action.payload.walletProviderName,
      };
    case CheckoutActions.SET_SEND_CLOSE_EVENT:
      return {
        ...state,
        sendCloseEvent: action.payload.sendCloseEvent,
      };
    default:
      return state;
  }
};
