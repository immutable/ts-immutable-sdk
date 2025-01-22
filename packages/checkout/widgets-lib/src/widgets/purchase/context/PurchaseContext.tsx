import { Squid } from '@0xsquid/sdk';
import { PurchaseItem } from '@imtbl/checkout-sdk';
import { createContext } from 'react';
import { Chain, Token } from '../../../lib/squid/types';
import { OrderQuoteResponse } from '../../../lib/primary-sales';

export interface PurchaseState {
  squid: {
    squid: Squid | null;
    chains: Chain[] | null;
    tokens: Token[] | null;
  };
  items: PurchaseItem[];
  quote: OrderQuoteResponse | null;
}

export const initialPurchaseState: PurchaseState = {
  squid: {
    squid: null,
    chains: null,
    tokens: null,
  },
  items: [],
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
  | SetSquidChains
  | SetSquidTokens
  | SetItems
  | SetQuote;

export enum PurchaseActions {
  SET_SQUID = 'SET_SQUID',
  SET_SQUID_CHAINS = 'SET_SQUID_CHAINS',
  SET_SQUID_TOKENS = 'SET_SQUID_TOKENS',
  SET_ITEMS = 'SET_ITEMS',
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
    case PurchaseActions.SET_QUOTE:
      return {
        ...state,
        quote: action.payload.quote,
      };
    default:
      return state;
  }
};
