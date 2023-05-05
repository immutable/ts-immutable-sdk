import { Web3Provider } from '@ethersproject/providers';
import {
  Checkout,
  ConnectionProviders,
  NetworkInfo,
} from '@imtbl/checkout-sdk';
import { createContext } from 'react';

export interface WalletState {
  checkout: Checkout | null;
  provider: Web3Provider | null;
  providerPreference: ConnectionProviders | null;
  network: NetworkInfo | null;
}

export const initialWalletState: WalletState = {
  checkout: null,
  provider: null,
  providerPreference: null,
  network: null,
};

export interface WalletContextState {
  walletState: WalletState;
  walletDispatch: React.Dispatch<WalletAction>;
}

export interface WalletAction {
  payload: ActionPayload;
}

type ActionPayload =
  | SetCheckoutPayload
  | SetProviderPayload
  | SetProviderPreferencePayload
  | SetNetworkInfoPayload;

export enum WalletActions {
  SET_CHECKOUT = 'SET_CHECKOUT',
  SET_PROVIDER = 'SET_PROVIDER',
  SET_PROVIDER_PREFERENCE = 'SET_PROVIDER_PREFERENCE',
  SET_NETWORK_INFO = 'SET_NETWORK_INFO',
}

export interface SetCheckoutPayload {
  type: WalletActions.SET_CHECKOUT;
  checkout: Checkout;
}

export interface SetProviderPayload {
  type: WalletActions.SET_PROVIDER;
  provider: Web3Provider;
}

export interface SetProviderPreferencePayload {
  type: WalletActions.SET_PROVIDER_PREFERENCE;
  providerPreference: ConnectionProviders;
}

export interface SetNetworkInfoPayload {
  type: WalletActions.SET_NETWORK_INFO;
  network: NetworkInfo;
}

export const WalletContext = createContext<WalletContextState>({
  walletState: initialWalletState,
  walletDispatch: () => {},
});

export type Reducer<S, A> = (prevState: S, action: A) => S;

export const walletReducer: Reducer<WalletState, WalletAction> = (
  state: WalletState,
  action: WalletAction
) => {
  switch (action.payload.type) {
    case WalletActions.SET_CHECKOUT:
      return {
        ...state,
        checkout: action.payload.checkout,
      };
    case WalletActions.SET_PROVIDER:
      return {
        ...state,
        provider: action.payload.provider,
      };
    case WalletActions.SET_PROVIDER_PREFERENCE:
      return {
        ...state,
        providerPreference: action.payload.providerPreference,
      };
    case WalletActions.SET_NETWORK_INFO:
      return {
        ...state,
        network: action.payload.network,
      };
    default:
      return state;
  }
};
