import { Squid } from '@0xsquid/sdk';
import { PurchaseItem, TokenInfo } from '@imtbl/checkout-sdk';
import { createContext } from 'react';
import { Chain } from '../../../lib/squid/types';

export interface PurchaseState {
  squid: Squid | null;
  items: PurchaseItem[];
  selectedToken: TokenInfo | undefined;
  chains: Chain[] | null;
}

export const initialPurchaseState: PurchaseState = {
  squid: null,
  items: [],
  selectedToken: undefined,
  chains: null,
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
  | SetChains;

export enum PurchaseActions {
  SET_SQUID = 'SET_SQUID',
  SET_ITEMS = 'SET_ITEMS',
  SET_SELECTED_TOKEN = 'SET_SELECTED_TOKEN',
  SET_CHAINS = 'SET_CHAINS',
}

export interface SetSquid {
  type: PurchaseActions.SET_SQUID;
  squid: Squid;
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
        squid: action.payload.squid,
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
    default:
      return state;
  }
};
