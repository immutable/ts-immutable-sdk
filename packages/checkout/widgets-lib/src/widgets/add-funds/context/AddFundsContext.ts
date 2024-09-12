import { Web3Provider } from '@ethersproject/providers';
import { createContext } from 'react';
import { Checkout, TokenInfo } from '@imtbl/checkout-sdk';
import { Squid } from '@0xsquid/sdk';

export interface AddFundsState {
  checkout: Checkout | null;
  provider: Web3Provider | null;
  allowedTokens: TokenInfo[] | null;
  squid: Squid | null;
}

export const initialAddFundsState: AddFundsState = {
  checkout: null,
  provider: null,
  allowedTokens: null,
  squid: null,
};

export interface AddFundsContextState {
  addFundsState: AddFundsState;
  addFundsDispatch: React.Dispatch<AddFundsAction>;
}

export interface AddFundsAction {
  payload: ActionPayload;
}

export type ActionPayload =
  | SetCheckoutPayload
  | SetProviderPayload
  | SetAllowedTokensPayload
  | SetSquid;

export enum AddFundsActions {
  SET_CHECKOUT = 'SET_CHECKOUT',
  SET_PROVIDER = 'SET_PROVIDER',
  SET_ALLOWED_TOKENS = 'SET_ALLOWED_TOKENS',
  SET_SQUID = 'SET_SQUID',
}

export interface SetCheckoutPayload {
  type: AddFundsActions.SET_CHECKOUT;
  checkout: Checkout;
}

export interface SetProviderPayload {
  type: AddFundsActions.SET_PROVIDER;
  provider: Web3Provider;
}

export interface SetAllowedTokensPayload {
  type: AddFundsActions.SET_ALLOWED_TOKENS;
  allowedTokens: TokenInfo[];
}
export interface SetSquid {
  type: AddFundsActions.SET_SQUID;
  squid: Squid;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const AddFundsContext = createContext<AddFundsContextState>({
  addFundsState: initialAddFundsState,
  addFundsDispatch: () => {},
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
    case AddFundsActions.SET_ALLOWED_TOKENS:
      return {
        ...state,
        allowedTokens: action.payload.allowedTokens,
      };
    case AddFundsActions.SET_SQUID:
      return {
        ...state,
        squid: action.payload.squid,
      };
    default:
      return state;
  }
};
