import { Web3Provider } from '@ethersproject/providers';
import { createContext } from 'react';
import { Checkout, WalletProviderName } from '@imtbl/checkout-sdk';

export interface ConnectState {
  checkout: Checkout | null;
  provider: Web3Provider | null;
  walletProviderName: WalletProviderName | null;
  sendCloseEvent: () => void;
}

export const initialConnectState: ConnectState = {
  checkout: null,
  provider: null,
  walletProviderName: null,
  sendCloseEvent: () => {},
};

export interface ConnectContextState {
  connectState: ConnectState;
  connectDispatch: React.Dispatch<ConnectAction>;
}

export interface ConnectAction {
  payload: ActionPayload;
}

type ActionPayload =
  | SetCheckoutPayload
  | SetProviderPayload
  | SetProviderNamePayload
  | SetSendCloseEventPayload;

export enum ConnectActions {
  SET_CHECKOUT = 'SET_CHECKOUT',
  SET_PROVIDER = 'SET_PROVIDER',
  SET_WALLET_PROVIDER_NAME = 'SET_WALLET_PROVIDER_NAME',
  SET_SEND_CLOSE_EVENT = 'SET_SEND_CLOSE_EVENT',
}

export interface SetCheckoutPayload {
  type: ConnectActions.SET_CHECKOUT;
  checkout: Checkout;
}

export interface SetProviderPayload {
  type: ConnectActions.SET_PROVIDER;
  provider: Web3Provider;
}

export interface SetProviderNamePayload {
  type: ConnectActions.SET_WALLET_PROVIDER_NAME;
  walletProviderName: WalletProviderName;
}

export interface SetSendCloseEventPayload {
  type: ConnectActions.SET_SEND_CLOSE_EVENT;
  sendCloseEvent: () => void;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ConnectContext = createContext<ConnectContextState>({
  connectState: initialConnectState,
  connectDispatch: () => {},
});

ConnectContext.displayName = 'ConnectContext'; // help with debugging Context in browser

export type Reducer<S, A> = (prevState: S, action: A) => S;

export const connectReducer: Reducer<ConnectState, ConnectAction> = (
  state: ConnectState,
  action: ConnectAction,
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
    case ConnectActions.SET_WALLET_PROVIDER_NAME:
      return {
        ...state,
        walletProviderName: action.payload.walletProviderName,
      };
    case ConnectActions.SET_SEND_CLOSE_EVENT:
      return {
        ...state,
        sendCloseEvent: action.payload.sendCloseEvent,
      };
    default:
      return state;
  }
};
