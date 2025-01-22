import { Squid } from '@0xsquid/sdk';
import { PurchaseItem, TokenInfo } from '@imtbl/checkout-sdk';
import { createContext } from 'react';
import { Chain, Token, RouteData } from '../../../lib/squid/types';
import { OrderQuoteResponse } from '../../../lib/primary-sales';

export interface PurchaseState {
  squid: {
    squid: Squid | null;
    chains: Chain[] | null;
    tokens: Token[] | null;
  };
  items: PurchaseItem[];
  selectedToken: TokenInfo | undefined;
  chains: Chain[] | null;
  selectedRouteData: RouteData | undefined;
  quote: OrderQuoteResponse | null;
}

export const initialPurchaseState: PurchaseState = {
  squid: {
    squid: null,
    chains: null,
    tokens: null,
  },
  items: [],
  selectedToken: undefined,
  chains: null,
  selectedRouteData: undefined,
  quote: null,
};

export interface PurchaseContextState {
  purchaseState: PurchaseState;
  purchaseDispatch: React.Dispatch<PurchaseAction>;
}

export interface PurchaseAction {
  payload: ActionPayload;
}

type ActionPayload =
  | SetSquid
  | SetItems
  | SetSelectedToken
  | SetChains
  | SetSelectedRouteData
  | SetSquidChains
  | SetSquidTokens
  | SetItems
  | SetQuote;

export enum PurchaseActions {
  SET_SQUID = 'SET_SQUID',
  SET_SQUID_CHAINS = 'SET_SQUID_CHAINS',
  SET_SQUID_TOKENS = 'SET_SQUID_TOKENS',
  SET_ITEMS = 'SET_ITEMS',
  SET_SELECTED_TOKEN = 'SET_SELECTED_TOKEN',
  SET_CHAINS = 'SET_CHAINS',
  SET_SELECTED_ROUTE_DATA = 'SET_SELECTED_ROUTE_DATA',
  SET_QUOTE = 'SET_QUOTE',
}

export interface SetSquid {
  type: PurchaseActions.SET_SQUID;
  squid: Squid;
}

export interface SetSquidChains {
  type: PurchaseActions.SET_SQUID_CHAINS;
  chains: Chain[];
}

export interface SetSquidTokens {
  type: PurchaseActions.SET_SQUID_TOKENS;
  tokens: Token[];
}

export interface SetItems {
  type: PurchaseActions.SET_ITEMS;
  items: PurchaseItem[];
}

export interface SetSelectedToken {
  type: PurchaseActions.SET_SELECTED_TOKEN;
  selectedToken: TokenInfo;
}

export interface SetChains {
  type: PurchaseActions.SET_CHAINS;
  chains: Chain[];
}

export interface SetSelectedRouteData {
  type: PurchaseActions.SET_SELECTED_ROUTE_DATA;
  selectedRouteData: RouteData;
}
export interface SetQuote {
  type: PurchaseActions.SET_QUOTE;
  quote: OrderQuoteResponse;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const PurchaseContext = createContext<PurchaseContextState>({
  purchaseState: initialPurchaseState,
  purchaseDispatch: () => {},
});

PurchaseContext.displayName = 'PurchaseContext';

export type Reducer<S, A> = (prevState: S, action: A) => S;

export const purchaseReducer: Reducer<PurchaseState, PurchaseAction> = (
  state: PurchaseState,
  action: PurchaseAction,
) => {
  switch (action.payload.type) {
    case PurchaseActions.SET_SQUID:
      return {
        ...state,
        squid: {
          ...state.squid,
          squid: action.payload.squid,
        },
      };
    case PurchaseActions.SET_SQUID_CHAINS:
      return {
        ...state,
        squid: {
          ...state.squid,
          chains: action.payload.chains,
        },
      };
    case PurchaseActions.SET_SQUID_TOKENS:
      return {
        ...state,
        squid: {
          ...state.squid,
          tokens: action.payload.tokens,
        },
      };
    case PurchaseActions.SET_ITEMS:
      return {
        ...state,
        items: action.payload.items,
      };
    case PurchaseActions.SET_SELECTED_TOKEN:
      return {
        ...state,
        selectedToken: action.payload.selectedToken,
      };
    case PurchaseActions.SET_CHAINS:
      return {
        ...state,
        chains: action.payload.chains,
      };
    case PurchaseActions.SET_SELECTED_ROUTE_DATA:
      return {
        ...state,
        selectedRouteData: action.payload.selectedRouteData,
      };
    case PurchaseActions.SET_QUOTE:
      return {
        ...state,
        quote: action.payload.quote,
      };
    default:
      return state;
  }
};
