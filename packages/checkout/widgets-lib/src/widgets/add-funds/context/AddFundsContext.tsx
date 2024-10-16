import { createContext } from 'react';
import { TokenInfo } from '@imtbl/checkout-sdk';
import { Squid } from '@0xsquid/sdk';
import { TokenBalance } from '@0xsquid/sdk/dist/types';
import { Chain, Token, RouteData } from '../types';

export interface AddFundsState {
  allowedTokens: TokenInfo[] | null;
  squid: Squid | null;
  chains: Chain[] | null;
  balances: TokenBalance[] | null;
  tokens: Token[] | null;
  routes: RouteData[];
  selectedRouteData: RouteData | undefined;
  selectedToken: TokenInfo | undefined;
  selectedAmount: string;
}

export const initialAddFundsState: AddFundsState = {
  allowedTokens: null,
  squid: null,
  chains: null,
  balances: null,
  tokens: null,
  routes: [],
  selectedRouteData: undefined,
  selectedToken: undefined,
  selectedAmount: '',
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
  | SetBalances
  | SetTokens
  | SetRoutes
  | SetSelectedRouteData
  | SetSelectedToken
  | SetSelectedAmount;

export enum AddFundsActions {
  SET_ALLOWED_TOKENS = 'SET_ALLOWED_TOKENS',
  SET_SQUID = 'SET_SQUID',
  SET_CHAINS = 'SET_CHAINS',
  SET_BALANCES = 'SET_BALANCES',
  SET_TOKENS = 'SET_TOKENS',
  SET_ROUTES = 'SET_ROUTES',
  SET_SELECTED_ROUTE_DATA = 'SET_SELECTED_ROUTE_DATA',
  SET_SELECTED_TOKEN = 'SET_SELECTED_TOKEN',
  SET_SELECTED_AMOUNT = 'SET_SELECTED_AMOUNT',
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

export interface SetRoutes {
  type: AddFundsActions.SET_ROUTES;
  routes: RouteData[];
}

export interface SetSelectedRouteData {
  type: AddFundsActions.SET_SELECTED_ROUTE_DATA;
  selectedRouteData: RouteData | undefined;
}

export interface SetSelectedToken {
  type: AddFundsActions.SET_SELECTED_TOKEN;
  selectedToken: TokenInfo | undefined;
}

export interface SetSelectedAmount {
  type: AddFundsActions.SET_SELECTED_AMOUNT;
  selectedAmount: string;
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
    case AddFundsActions.SET_TOKENS:
      return {
        ...state,
        tokens: action.payload.tokens,
      };
    case AddFundsActions.SET_ROUTES:
      return {
        ...state,
        routes: action.payload.routes,
      };
    case AddFundsActions.SET_SELECTED_ROUTE_DATA:
      return {
        ...state,
        selectedRouteData: action.payload.selectedRouteData,
      };
    case AddFundsActions.SET_SELECTED_TOKEN:
      return {
        ...state,
        selectedToken: action.payload.selectedToken,
      };
    case AddFundsActions.SET_SELECTED_AMOUNT:
      return {
        ...state,
        selectedAmount: action.payload.selectedAmount,
      };
    default:
      return state;
  }
};
