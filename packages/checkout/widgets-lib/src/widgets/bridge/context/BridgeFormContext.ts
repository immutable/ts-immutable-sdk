import { GetBalanceResult } from '@imtbl/checkout-sdk';
import { createContext } from 'react';

export interface BridgeFormState {
  bridgeFromToken: GetBalanceResult | null;
  bridgeFromAmount: string;
  loading: boolean;
  bridgeFromTokenError: string;
  bridgeFromAmountError: string;
}

export const initialBridgeFormState: BridgeFormState = {
  bridgeFromToken: null,
  bridgeFromAmount: '',
  loading: false,
  bridgeFromTokenError: '',
  bridgeFromAmountError: '',
};

export interface BridgeFormContextState {
  bridgeFormState: BridgeFormState;
  bridgeFormDispatch: React.Dispatch<BridgeFormAction>;
}

export interface BridgeFormAction {
  payload: ActionPayload;
}

type ActionPayload =
  | SetBridgeFromTokenPayload
  | SetBridgeFromAmountPayload
  | SetLoadingPayload
  | SetBridgeFromTokenErrorPayload
  | SetBridgeFromAmountErrorPayload;

export enum BridgeFormActions {
  SET_BRIDGE_FROM_TOKEN = 'SET_BRIDGE_FROM_TOKEN',
  SET_BRIDGE_FROM_AMOUNT = 'SET_BRIDGE_FROM_AMOUNT',
  SET_LOADING = 'SET_LOADING',
  SET_BRIDGE_FROM_TOKEN_ERROR = 'SET_BRIDGE_FROM_TOKEN_ERROR',
  SET_BRIDGE_FROM_AMOUNT_ERROR = 'SET_BRIDGE_FROM_AMOUNT_ERROR',
}

export interface SetBridgeFromTokenPayload {
  type: BridgeFormActions.SET_BRIDGE_FROM_TOKEN;
  bridgeFromToken: GetBalanceResult | null;
}

export interface SetBridgeFromAmountPayload {
  type: BridgeFormActions.SET_BRIDGE_FROM_AMOUNT;
  bridgeFromAmount: string;
}

export interface SetLoadingPayload {
  type: BridgeFormActions.SET_LOADING;
  loading: boolean;
}

export interface SetBridgeFromTokenErrorPayload {
  type: BridgeFormActions.SET_BRIDGE_FROM_TOKEN_ERROR;
  bridgeFromTokenError: string;
}

export interface SetBridgeFromAmountErrorPayload {
  type: BridgeFormActions.SET_BRIDGE_FROM_AMOUNT_ERROR;
  bridgeFromAmountError: string;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const BridgeFormContext = createContext<BridgeFormContextState>({
  bridgeFormState: initialBridgeFormState,
  bridgeFormDispatch: () => {},
});

export type Reducer<S, A> = (prevState: S, action: A) => S;

export const swapFormReducer: Reducer<BridgeFormState, BridgeFormAction> = (
  state: BridgeFormState,
  action: BridgeFormAction,
) => {
  switch (action.payload.type) {
    case BridgeFormActions.SET_BRIDGE_FROM_TOKEN:
      return {
        ...state,
        bridgeFromToken: action.payload.bridgeFromToken,
      };
    case BridgeFormActions.SET_BRIDGE_FROM_AMOUNT:
      if (state.bridgeFromAmount === action.payload.bridgeFromAmount) return state;
      return {
        ...state,
        bridgeFromAmount: action.payload.bridgeFromAmount,
      };
    case BridgeFormActions.SET_LOADING:
      return {
        ...state,
        loading: action.payload.loading,
      };
    case BridgeFormActions.SET_BRIDGE_FROM_TOKEN_ERROR:
      return {
        ...state,
        bridgeFromTokenError: action.payload.bridgeFromTokenError,
      };
    case BridgeFormActions.SET_BRIDGE_FROM_AMOUNT_ERROR:
      return {
        ...state,
        bridgeFromAmountError: action.payload.bridgeFromAmountError,
      };
    default:
      return state;
  }
};
