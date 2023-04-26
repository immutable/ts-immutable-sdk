import { Web3Provider } from '@ethersproject/providers';
import { createContext } from 'react';
import { Checkout, ConnectionProviders } from '@imtbl/checkout-sdk-web';

export interface ConnectState {
  checkout: Checkout | null;
  provider: Web3Provider | null;
  providerPreference: ConnectionProviders | null;
}

export const initialConnectState: ConnectState = {
  checkout: null,
  provider: null,
  providerPreference: null,
};

export interface ConnectContextState {
  connectState: ConnectState;
  connectDispatch: React.Dispatch<ConnectAction>;
}

export interface ConnectAction {
  payload: ActionPayload;
}

type ActionPayload = SetCheckoutPayload | SetProviderPayload | SetProviderPreferencePayload;

export enum ConnectActions {
  SET_CHECKOUT = 'SET_CHECKOUT',
  SET_PROVIDER = 'SET_PROVIDER',
  SET_PROVIDER_PREFERENCE = 'SET_PROVIDER_PREFERENCE'
}

export interface SetCheckoutPayload {
  type: ConnectActions.SET_CHECKOUT;
  checkout: Checkout;
}

export interface SetProviderPayload {
  type: ConnectActions.SET_PROVIDER;
  provider: Web3Provider;
}

export interface SetProviderPreferencePayload {
  type: ConnectActions.SET_PROVIDER_PREFERENCE;
  providerPreference: ConnectionProviders;
}

export const ConnectContext = createContext<ConnectContextState>({
  connectState: initialConnectState,
  connectDispatch: () => {},
});

export type Reducer<S, A> = (prevState: S, action: A) => S;

export const connectReducer: Reducer<ConnectState, ConnectAction> = (
  state: ConnectState,
  action: ConnectAction
) => {
  switch (action.payload.type) {
    case ConnectActions.SET_CHECKOUT:
      return {
        ...state,
        checkout: action.payload.checkout,
      };
    case ConnectActions.SET_PROVIDER:
      return {
        ...state,
        provider: action.payload.provider,
      };
    case ConnectActions.SET_PROVIDER_PREFERENCE:
      return {
        ...state,
        providerPreference: action.payload.providerPreference,
      };
    default:
      return state;
  }
};
