import { Web3Provider } from '@ethersproject/providers';
import { createContext } from 'react';
import { Checkout, TokenInfo } from '@imtbl/checkout-sdk';
import { Squid } from '@0xsquid/sdk';
import { TokenBalance } from '@0xsquid/sdk/dist/types';
import { Chain, Token } from '../types';

export interface AddFundsState {
  checkout: Checkout | null;
  provider: Web3Provider | null;
  allowedTokens: TokenInfo[] | null;
  squid: Squid | null;
  chains: Chain[] | null;
  balances: TokenBalance[] | null;
  tokens: Token[] | null;
}

export const initialAddFundsState: AddFundsState = {
  checkout: null,
  provider: null,
  allowedTokens: null,
  squid: null,
  chains: null,
  balances: null,
  tokens: null,
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
  | SetProviderPayload
  | SetAllowedTokensPayload
  | SetSquid
  | SetChains
  | SetBalances
  | SetTokens;

export enum AddFundsActions {
  SET_CHECKOUT = 'SET_CHECKOUT',
  SET_PROVIDER = 'SET_PROVIDER',
  SET_ALLOWED_TOKENS = 'SET_ALLOWED_TOKENS',
  SET_SQUID = 'SET_SQUID',
  SET_CHAINS = 'SET_CHAINS',
  SET_BALANCES = 'SET_BALANCES',
  SET_TOKENS = 'SET_TOKENS',
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

export interface SetChains {
  type: AddFundsActions.SET_CHAINS;
  chains: Chain[];
}

export interface SetBalances {
  type: AddFundsActions.SET_BALANCES;
  balances: TokenBalance[];
}

export interface SetTokens {
  type: AddFundsActions.SET_TOKENS;
  tokens: Token[];
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
    case AddFundsActions.SET_CHAINS:
      return {
        ...state,
        chains: action.payload.chains,
      };
    case AddFundsActions.SET_BALANCES:
      return {
        ...state,
        balances: action.payload.balances,
      };
    case AddFundsActions.SET_TOKENS:
      return {
        ...state,
        tokens: action.payload.tokens,
      };
    default:
      return state;
  }
};
