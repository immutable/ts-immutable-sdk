import { Squid } from '@0xsquid/sdk';
import { PurchaseItem, TokenInfo } from '@imtbl/checkout-sdk';
import { createContext } from 'react';

export interface PurchaseState {
  squid: Squid | null;
  items: PurchaseItem[];
  selectedToken: TokenInfo | undefined;
}

export const initialPurchaseState: PurchaseState = {
  squid: null,
  items: [],
  selectedToken: undefined,
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
  | SetSelectedToken;

export enum PurchaseActions {
  SET_SQUID = 'SET_SQUID',
  SET_ITEMS = 'SET_ITEMS',
  SET_SELECTED_TOKEN = 'SET_SELECTED_TOKEN',
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
    default:
      return state;
  }
};
