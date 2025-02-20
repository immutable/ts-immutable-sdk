import { createContext } from 'react';
import {
  Checkout,
  WrappedBrowserProvider,
} from '@imtbl/checkout-sdk';
import { Passport } from '@imtbl/passport';

export interface CommerceState {
  checkout: Checkout | undefined;
  provider: WrappedBrowserProvider | undefined;
  passport: Passport | undefined;
}

export const initialCommerceState: CommerceState = {
  checkout: undefined,
  provider: undefined,
  passport: undefined,
};

export interface CommerceContextState {
  commerceState: CommerceState;
  commerceDispatch: React.Dispatch<CommerceAction>;
}

export interface CommerceAction {
  payload: ActionPayload;
}

type ActionPayload =
  | SetCheckoutPayload
  | SetProviderPayload
  | SetPassportPayload;

export enum CommerceActions {
  SET_CHECKOUT = 'SET_CHECKOUT',
  SET_PROVIDER = 'SET_PROVIDER',
  SET_PASSPORT = 'SET_PASSPORT',
}

export interface SetCheckoutPayload {
  type: CommerceActions.SET_CHECKOUT;
  checkout: Checkout;
}

export interface SetProviderPayload {
  type: CommerceActions.SET_PROVIDER;
  provider: WrappedBrowserProvider | undefined;
}

export interface SetPassportPayload {
  type: CommerceActions.SET_PASSPORT;
  passport: Passport | undefined;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const CommerceContext = createContext<CommerceContextState>({
  commerceState: initialCommerceState,
  commerceDispatch: () => { },
});

CommerceContext.displayName = 'CommerceContext'; // help with debugging Context in browser

export type Reducer<S, A> = (prevState: S, action: A) => S;

export const commerceReducer: Reducer<CommerceState, CommerceAction> = (
  state: CommerceState,
  action: CommerceAction,
) => {
  switch (action.payload.type) {
    case CommerceActions.SET_CHECKOUT:
      return {
        ...state,
        checkout: action.payload.checkout,
      };
    case CommerceActions.SET_PROVIDER:
      return {
        ...state,
        provider: action.payload.provider,
      };
    case CommerceActions.SET_PASSPORT:
      return {
        ...state,
        passport: action.payload.passport,
      };
    default:
      return state;
  }
};
