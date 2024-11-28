import { createContext } from 'react';
import { TokenInfo } from '@imtbl/checkout-sdk';
import { RouteData } from '../../../lib/squid/types';

export interface AddTokensState {
  id: string;
  allowedTokens: TokenInfo[] | null;
  selectedRouteData: RouteData | undefined;
  selectedToken: TokenInfo | undefined;
  selectedAmount: string;
  isSwapAvailable: boolean | undefined;
}

export const initialAddTokensState: AddTokensState = {
  id: '',
  allowedTokens: null,
  selectedRouteData: undefined,
  selectedToken: undefined,
  selectedAmount: '',
  isSwapAvailable: undefined,
};

export interface AddTokensContextState {
  addTokensState: AddTokensState;
  addTokensDispatch: React.Dispatch<AddTokensAction>;
}

export interface AddTokensAction {
  payload: ActionPayload;
}

type ActionPayload =
  | SetId
  | SetAllowedTokensPayload
  | SetSelectedRouteData
  | SetSelectedToken
  | SetSelectedAmount
  | SetIsSwapAvailable;

export enum AddTokensActions {
  SET_ID = 'SET_ID',
  SET_ALLOWED_TOKENS = 'SET_ALLOWED_TOKENS',
  SET_SELECTED_ROUTE_DATA = 'SET_SELECTED_ROUTE_DATA',
  SET_SELECTED_TOKEN = 'SET_SELECTED_TOKEN',
  SET_SELECTED_AMOUNT = 'SET_SELECTED_AMOUNT',
  SET_IS_SWAP_AVAILABLE = 'SET_IS_SWAP_AVAILABLE',
}

export interface SetId {
  type: AddTokensActions.SET_ID;
  id: string;
}

export interface SetAllowedTokensPayload {
  type: AddTokensActions.SET_ALLOWED_TOKENS;
  allowedTokens: TokenInfo[];
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
    case AddTokensActions.SET_ID:
      return {
        ...state,
        id: action.payload.id,
      };
    case AddTokensActions.SET_ALLOWED_TOKENS:
      return {
        ...state,
        allowedTokens: action.payload.allowedTokens,
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
