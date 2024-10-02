import { Web3Provider } from '@ethersproject/providers';
import { createContext } from 'react';
import { Checkout, TokenInfo } from '@imtbl/checkout-sdk';
import { Squid } from '@0xsquid/sdk';
import { TokenBalance } from '@0xsquid/sdk/dist/types';
import { Chain } from '../types';

export interface AddFundsState {
  allowedTokens: TokenInfo[] | null;
  squid: Squid | null;
  chains: Chain[] | null;
  balances: TokenBalance[] | null;
}

export const initialAddFundsState: AddFundsState = {
  allowedTokens: null,
  squid: null,
  chains: null,
  balances: null,
};

export interface AddFundsContextState {
  addFundsState: AddFundsState;
  addFundsDispatch: React.Dispatch<AddFundsAction>;
}

export interface AddFundsAction {
  payload: ActionPayload;
}

type ActionPayload =
  | SetAllowedTokensPayload
  | SetSquid
  | SetChains
  | SetBalances;

export enum AddFundsActions {
  SET_ALLOWED_TOKENS = 'SET_ALLOWED_TOKENS',
  SET_SQUID = 'SET_SQUID',
  SET_CHAINS = 'SET_CHAINS',
  SET_BALANCES = 'SET_BALANCES',
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
    default:
      return state;
  }
};
