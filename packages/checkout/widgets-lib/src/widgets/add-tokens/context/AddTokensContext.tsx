import { createContext } from 'react';
import { TokenInfo } from '@imtbl/checkout-sdk';
import { Squid } from '@0xsquid/sdk';
import { TokenBalance } from '@0xsquid/sdk/dist/types';
import { Chain, Token, RouteData } from '../types';

export interface AddTokensState {
  allowedTokens: TokenInfo[] | null;
  squid: Squid | null;
  chains: Chain[] | null;
  balances: TokenBalance[] | null;
  tokens: Token[] | null;
  routes: RouteData[];
  selectedRouteData: RouteData | undefined;
  selectedToken: TokenInfo | undefined;
  selectedAmount: string;
  isSwapAvailable: boolean;
}

export const initialAddTokensState: AddTokensState = {
  allowedTokens: null,
  squid: null,
  chains: null,
  balances: null,
  tokens: null,
  routes: [],
  selectedRouteData: undefined,
  selectedToken: undefined,
  selectedAmount: '',
  isSwapAvailable: false,
};

export interface AddTokensContextState {
  addTokensState: AddTokensState;
  addTokensDispatch: React.Dispatch<AddTokensAction>;
}

export interface AddTokensAction {
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
  | SetSelectedAmount
  | SetIsSwapAvailable;

export enum AddTokensActions {
  SET_ALLOWED_TOKENS = 'SET_ALLOWED_TOKENS',
  SET_SQUID = 'SET_SQUID',
  SET_CHAINS = 'SET_CHAINS',
  SET_BALANCES = 'SET_BALANCES',
  SET_TOKENS = 'SET_TOKENS',
  SET_ROUTES = 'SET_ROUTES',
  SET_SELECTED_ROUTE_DATA = 'SET_SELECTED_ROUTE_DATA',
  SET_SELECTED_TOKEN = 'SET_SELECTED_TOKEN',
  SET_SELECTED_AMOUNT = 'SET_SELECTED_AMOUNT',
  SET_IS_SWAP_AVAILABLE = 'SET_IS_SWAP_AVAILABLE',
}

export interface SetAllowedTokensPayload {
  type: AddTokensActions.SET_ALLOWED_TOKENS;
  allowedTokens: TokenInfo[];
}
export interface SetSquid {
  type: AddTokensActions.SET_SQUID;
  squid: Squid;
}

export interface SetChains {
  type: AddTokensActions.SET_CHAINS;
  chains: Chain[];
}

export interface SetBalances {
  type: AddTokensActions.SET_BALANCES;
  balances: TokenBalance[];
}

export interface SetTokens {
  type: AddTokensActions.SET_TOKENS;
  tokens: Token[];
}

export interface SetRoutes {
  type: AddTokensActions.SET_ROUTES;
  routes: RouteData[];
}

export interface SetSelectedRouteData {
  type: AddTokensActions.SET_SELECTED_ROUTE_DATA;
  selectedRouteData: RouteData | undefined;
}

export interface SetSelectedToken {
  type: AddTokensActions.SET_SELECTED_TOKEN;
  selectedToken: TokenInfo | undefined;
}

export interface SetSelectedAmount {
  type: AddTokensActions.SET_SELECTED_AMOUNT;
  selectedAmount: string;
}

export interface SetIsSwapAvailable {
  type: AddTokensActions.SET_IS_SWAP_AVAILABLE;
  isSwapAvailable: boolean;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const AddTokensContext = createContext<AddTokensContextState>({
  addTokensState: initialAddTokensState,
  addTokensDispatch: () => {},
});

AddTokensContext.displayName = 'AddTokensContext';

export type Reducer<S, A> = (prevState: S, action: A) => S;

export const addTokensReducer: Reducer<AddTokensState, AddTokensAction> = (
  state: AddTokensState,
  action: AddTokensAction,
) => {
  switch (action.payload.type) {
    case AddTokensActions.SET_ALLOWED_TOKENS:
      return {
        ...state,
        allowedTokens: action.payload.allowedTokens,
      };
    case AddTokensActions.SET_SQUID:
      return {
        ...state,
        squid: action.payload.squid,
      };
    case AddTokensActions.SET_CHAINS:
      return {
        ...state,
        chains: action.payload.chains,
      };
    case AddTokensActions.SET_BALANCES:
      return {
        ...state,
        balances: action.payload.balances,
      };
    case AddTokensActions.SET_TOKENS:
      return {
        ...state,
        tokens: action.payload.tokens,
      };
    case AddTokensActions.SET_ROUTES:
      return {
        ...state,
        routes: action.payload.routes,
      };
    case AddTokensActions.SET_SELECTED_ROUTE_DATA:
      return {
        ...state,
        selectedRouteData: action.payload.selectedRouteData,
      };
    case AddTokensActions.SET_SELECTED_TOKEN:
      return {
        ...state,
        selectedToken: action.payload.selectedToken,
      };
    case AddTokensActions.SET_SELECTED_AMOUNT:
      return {
        ...state,
        selectedAmount: action.payload.selectedAmount,
      };
    case AddTokensActions.SET_IS_SWAP_AVAILABLE:
      return {
        ...state,
        isSwapAvailable: action.payload.isSwapAvailable,
      };
    default:
      return state;
  }
};
