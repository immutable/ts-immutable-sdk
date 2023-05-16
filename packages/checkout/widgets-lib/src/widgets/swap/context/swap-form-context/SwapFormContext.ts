import { TokenInfo } from '@imtbl/checkout-sdk';
import { createContext } from 'react';

export interface SwapFormState {
  swapFromToken: TokenInfo | null;
  swapFromAmount: string;
  swapToToken: TokenInfo | null;
  swapToAmount: string;
}

export const initialSwapFormState: SwapFormState = {
  swapFromToken: null,
  swapFromAmount: '',
  swapToToken: null,
  swapToAmount: '',
};

export interface SwapFormContextState {
  swapFormState: SwapFormState;
  swapFormDispatch: React.Dispatch<SwapFormAction>;
}

export interface SwapFormAction {
  payload: ActionPayload;
}

type ActionPayload =
  | SetSwapFromTokenPayload
  | SetSwapFromAmountPayload
  | SetSwapToTokenPayload
  | SetSwapToAmountPayload;

export enum SwapFormActions {
  SET_SWAP_FROM_TOKEN = 'SET_SWAP_FROM_TOKEN',
  SET_SWAP_FROM_AMOUNT = 'SET_SWAP_FROM_AMOUNT',
  SET_SWAP_TO_TOKEN = 'SET_SWAP_TO_TOKEN',
  SET_SWAP_TO_AMOUNT = 'SET_SWAP_TO_AMOUNT',
}

export interface SetSwapToTokenPayload {
  type: SwapFormActions.SET_SWAP_TO_TOKEN;
  swapToToken: TokenInfo;
}

export interface SetSwapToAmountPayload {
  type: SwapFormActions.SET_SWAP_TO_AMOUNT;
  swapToAmount: string;
}

export interface SetSwapFromTokenPayload {
  type: SwapFormActions.SET_SWAP_FROM_TOKEN;
  swapFromToken: TokenInfo;
}

export interface SetSwapFromAmountPayload {
  type: SwapFormActions.SET_SWAP_FROM_AMOUNT;
  swapFromAmount: string;
}

export const SwapFormContext = createContext<SwapFormContextState>({
  swapFormState: initialSwapFormState,
  swapFormDispatch: () => {},
});

export type Reducer<S, A> = (prevState: S, action: A) => S;

export const swapFormReducer: Reducer<SwapFormState, SwapFormAction> = (
  state: SwapFormState,
  action: SwapFormAction
) => {
  switch (action.payload.type) {
    case SwapFormActions.SET_SWAP_TO_TOKEN:
      return {
        ...state,
        swapToToken: action.payload.swapToToken,
      };
    case SwapFormActions.SET_SWAP_TO_AMOUNT:
      return {
        ...state,
        swapToAmount: action.payload.swapToAmount,
      };
    case SwapFormActions.SET_SWAP_FROM_TOKEN:
      return {
        ...state,
        swapFromToken: action.payload.swapFromToken,
      };
    case SwapFormActions.SET_SWAP_FROM_AMOUNT:
      return {
        ...state,
        swapFromAmount: action.payload.swapFromAmount,
      };
    default:
      return state;
  }
};
