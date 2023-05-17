import { TokenInfo } from '@imtbl/checkout-sdk';
import { createContext } from 'react';

export interface SwapFormState {
  swapFromToken: TokenInfo | null;
  swapFromAmount: string;
  swapToToken: TokenInfo | null;
  swapToAmount: string;
  swapFromFiatValue: string;
}

export const initialSwapFormState: SwapFormState = {
  swapFromToken: null,
  swapFromAmount: '',
  swapToToken: null,
  swapToAmount: '',
  swapFromFiatValue: '',
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
  | SetSwapToAmountPayload
  | SetSwapFromFiatValue;

export enum SwapFormActions {
  SET_SWAP_FROM_TOKEN = 'SET_SWAP_FROM_TOKEN',
  SET_SWAP_FROM_AMOUNT = 'SET_SWAP_FROM_AMOUNT',
  SET_SWAP_TO_TOKEN = 'SET_SWAP_TO_TOKEN',
  SET_SWAP_TO_AMOUNT = 'SET_SWAP_TO_AMOUNT',
  SET_SWAP_FROM_FIAT_VALUE = 'SET_SWAP_FROM_FIAT_VALUE',
}

export interface SetSwapToTokenPayload {
  type: SwapFormActions.SET_SWAP_TO_TOKEN;
  swapToToken: TokenInfo | null;
}

export interface SetSwapToAmountPayload {
  type: SwapFormActions.SET_SWAP_TO_AMOUNT;
  swapToAmount: string;
}

export interface SetSwapFromTokenPayload {
  type: SwapFormActions.SET_SWAP_FROM_TOKEN;
  swapFromToken: TokenInfo | null;
}

export interface SetSwapFromAmountPayload {
  type: SwapFormActions.SET_SWAP_FROM_AMOUNT;
  swapFromAmount: string;
}

export interface SetSwapFromFiatValue {
  type: SwapFormActions.SET_SWAP_FROM_FIAT_VALUE;
  swapFromFiatValue: string;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const SwapFormContext = createContext<SwapFormContextState>({
  swapFormState: initialSwapFormState,
  swapFormDispatch: () => {},
});

export type Reducer<S, A> = (prevState: S, action: A) => S;

export const swapFormReducer: Reducer<SwapFormState, SwapFormAction> = (
  state: SwapFormState,
  action: SwapFormAction,
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
      if (state.swapFromAmount === action.payload.swapFromAmount) return state;
      return {
        ...state,
        swapFromAmount: action.payload.swapFromAmount,
      };
    case SwapFormActions.SET_SWAP_FROM_FIAT_VALUE:
      return {
        ...state,
        swapFromFiatValue: action.payload.swapFromFiatValue,
      };
    default:
      return state;
  }
};
