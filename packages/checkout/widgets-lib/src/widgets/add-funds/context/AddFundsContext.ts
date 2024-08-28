import { Web3Provider } from '@ethersproject/providers';
import { createContext } from 'react';
import { Checkout } from '@imtbl/checkout-sdk';

export interface AddFundsState {
  checkout: Checkout | null;
  provider: Web3Provider | null;
}

export const initialAddFundsState: AddFundsState = {
  checkout: null,
  provider: null,
};

export interface AddFundsContextState {
  addFundsState: AddFundsState;
  addFundsDispatch: React.Dispatch<AddFundsAction>;
}

export interface AddFundsAction {
  payload: ActionPayload;
}

type ActionPayload =
    | SetCheckoutPayload
    | SetProviderPayload;

export enum AddFundsActions {
  SET_CHECKOUT = 'SET_CHECKOUT',
  SET_PROVIDER = 'SET_PROVIDER',
}

export interface SetCheckoutPayload {
  type: AddFundsActions.SET_CHECKOUT;
  checkout: Checkout;
}

export interface SetProviderPayload {
  type: AddFundsActions.SET_PROVIDER;
  provider: Web3Provider;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const AddFundsContext = createContext<AddFundsContextState>({
  addFundsState: initialAddFundsState,
  addFundsDispatch: () => {
  },
});

AddFundsContext.displayName = 'AddFundsContext';

export type Reducer<S, A> = (prevState: S, action: A) => S;

export const addFundsReducer: Reducer<AddFundsState, AddFundsAction> = (
  state: AddFundsState,
  action: AddFundsAction,
) => {
  switch (action.payload.type) {
    case AddFundsActions.SET_CHECKOUT:
      return {
        ...state,
        checkout: action.payload.checkout,
      };
    case AddFundsActions.SET_PROVIDER:
      return {
        ...state,
        provider: action.payload.provider,
      };
    default:
      return state;
  }
};
