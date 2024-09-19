import { Web3Provider } from '@ethersproject/providers';
import { createContext } from 'react';
import {
  Checkout,
} from '@imtbl/checkout-sdk';
import { Passport } from '@imtbl/passport';

export interface CheckoutState {
  checkout: Checkout | undefined;
  provider: Web3Provider | undefined;
  passport: Passport | undefined;
}

export const initialCheckoutState: CheckoutState = {
  checkout: undefined,
  provider: undefined,
  passport: undefined,
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
  | SetPassportPayload;

export enum CheckoutActions {
  SET_CHECKOUT = 'SET_CHECKOUT',
  SET_PROVIDER = 'SET_PROVIDER',
  SET_PASSPORT = 'SET_PASSPORT',
}

export interface SetCheckoutPayload {
  type: CheckoutActions.SET_CHECKOUT;
  checkout: Checkout;
}

export interface SetProviderPayload {
  type: CheckoutActions.SET_PROVIDER;
  provider: Web3Provider | undefined;
}

export interface SetPassportPayload {
  type: CheckoutActions.SET_PASSPORT;
  passport: Passport | undefined;
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
    default:
      return state;
  }
};
