import { Squid } from '@0xsquid/sdk';
import { PurchaseItem } from '@imtbl/checkout-sdk';
import { createContext } from 'react';

export interface PurchaseState {
  squid: Squid | null;
  items: PurchaseItem[];
}

export const initialPurchaseState: PurchaseState = {
  squid: null,
  items: [
  //   {
  //   productId: 'kookaburra',
  //   qty: 1,
  //   name: 'Kookaburra',
  //   image:
  //     'https://iguanas.mystagingwebsite.com/wp-content/uploads/2024/05/character-image-4-1.png',
  //   description: 'Kookaburra',
  // },
    {
      productId: 'quokka',
      qty: 2,
      name: 'Quokka',
      image:
      'https://iguanas.mystagingwebsite.com/wp-content/uploads/2024/05/character-image-8-1.png',
      description: 'Quokka',
    },
    // {
    //   productId: 'ibis',
    //   qty: 1,
    //   name: 'Ibis',
    //   image:
    //   'https://iguanas.mystagingwebsite.com/wp-content/uploads/2024/05/character-image-1-1.png',
    //   description: 'Ibis',
    // }
  ],
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
  | SetItems;

export enum PurchaseActions {
  SET_SQUID = 'SET_SQUID',
  SET_ITEMS = 'SET_ITEMS',
}

export interface SetSquid {
  type: PurchaseActions.SET_SQUID;
  squid: Squid;
}

export interface SetItems {
  type: PurchaseActions.SET_ITEMS;
  items: PurchaseItem[];
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
    default:
      return state;
  }
};
