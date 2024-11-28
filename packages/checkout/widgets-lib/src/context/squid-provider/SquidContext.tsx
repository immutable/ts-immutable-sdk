import { createContext } from 'react';
import { Squid } from '@0xsquid/sdk';
import { TokenBalance } from '@0xsquid/sdk/dist/types';
import { Chain, RouteData, Token } from '../../lib/squid/types';

export interface SquidState {
  squid: Squid | null;
  chains: Chain[] | null;
  balances: TokenBalance[] | null;
  tokens: Token[] | null;
  routes: RouteData[];
}

export const initialSquidState: SquidState = {
  squid: null,
  chains: null,
  balances: null,
  tokens: null,
  routes: [],
};

export interface SquidContextState {
  squidState: SquidState;
  squidDispatch: React.Dispatch<SquidAction>;
}

export interface SquidAction {
  payload: SquidActionPayload;
}

type SquidActionPayload =
  | SetSquidPayload
  | SetChainsPayload
  | SetBalancesPayload
  | SetTokensPayload
  | SetRoutesPayload;

export enum SquidActions {
  SET_SQUID = 'SET_SQUID',
  SET_CHAINS = 'SET_CHAINS',
  SET_BALANCES = 'SET_BALANCES',
  SET_TOKENS = 'SET_TOKENS',
  SET_ROUTES = 'SET_ROUTES',
}

export interface SetSquidPayload {
  type: SquidActions.SET_SQUID;
  squid: Squid;
}

export interface SetChainsPayload {
  type: SquidActions.SET_CHAINS;
  chains: Chain[];
}

export interface SetBalancesPayload {
  type: SquidActions.SET_BALANCES;
  balances: TokenBalance[];
}

export interface SetTokensPayload {
  type: SquidActions.SET_TOKENS;
  tokens: Token[];
}

export interface SetRoutesPayload {
  type: SquidActions.SET_ROUTES;
  routes: RouteData[];
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const SquidContext = createContext<SquidContextState>({
  squidState: initialSquidState,
  squidDispatch: () => {},
});

export type Reducer<S, A> = (prevState: S, action: A) => S;

export const squidReducer: Reducer<SquidState, SquidAction> = (
  state: SquidState,
  action: SquidAction,
) => {
  switch (action.payload.type) {
    case SquidActions.SET_SQUID:
      return {
        ...state,
        squid: action.payload.squid,
      };
    case SquidActions.SET_CHAINS:
      return {
        ...state,
        chains: action.payload.chains,
      };
    case SquidActions.SET_BALANCES:
      return {
        ...state,
        balances: action.payload.balances,
      };
    case SquidActions.SET_TOKENS:
      return {
        ...state,
        tokens: action.payload.tokens,
      };
    case SquidActions.SET_ROUTES:
      return {
        ...state,
        routes: action.payload.routes,
      };
    default:
      return state;
  }
};
