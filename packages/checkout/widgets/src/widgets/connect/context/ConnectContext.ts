import { Web3Provider } from "@ethersproject/providers";
import { createContext } from "react";
import { Checkout } from '@imtbl/checkout-sdk-web';

export interface ConnectState {
  checkout: Checkout | null
  provider: Web3Provider | null
}

export const initialState: ConnectState = {
  checkout: null,
  provider: null
}

export interface ConnectContextState {
  state: ConnectState,
  dispatch: React.Dispatch<Action>,
}

export interface Action {
  payload: ActionPayload
}

type ActionPayload = SetCheckoutPayload | SetProviderPayload

export enum Actions {
  SET_CHECKOUT = "set-checkout",
  SET_PROVIDER = "set-provider",
}

export interface SetCheckoutPayload {
  type: Actions.SET_CHECKOUT,
  checkout: Checkout
}

export interface SetProviderPayload {
  type: Actions.SET_PROVIDER,
  provider: Web3Provider
}

export const ConnectContext = createContext<ConnectContextState>({
  state: initialState,
  dispatch: () => {},
});

export type Reducer<S, A> = (prevState: S, action: A) => S;

export const connectReducer: Reducer<ConnectState, Action> = (state: ConnectState, action: Action) => {
  switch (action.payload.type) {
    case Actions.SET_CHECKOUT:
      return {
        ...state,
        checkout: action.payload.checkout
      }
    case Actions.SET_PROVIDER:
      return {
        ...state,
        provider: action.payload.provider
      }
    default:
      return state;
  }
}
