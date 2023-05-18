import { GetBalanceResult, TokenInfo } from '@imtbl/checkout-sdk';
import { createContext } from 'react';

export interface SwapFormState {
  swapFromToken: GetBalanceResult | null;
  swapFromAmount: string;
  swapToToken: TokenInfo | null;
  swapToAmount: string;
  swapFromFiatValue: string;
  blockFetchQuote: boolean;
  swapFromTokenError: string;
  swapFromAmountError: string;
  swapToTokenError: string;
  swapToAmountError: string;
}

export const initialSwapFormState: SwapFormState = {
  swapFromToken: null,
  swapFromAmount: '',
  swapToToken: null,
  swapToAmount: '',
  swapFromFiatValue: '',
  blockFetchQuote: true,
  swapFromTokenError: '',
  swapFromAmountError: '',
  swapToTokenError: '',
  swapToAmountError: '',
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
  | SetSwapFromFiatValuePayload
  | SetBlockFetchQuote
  | SetSwapFromTokenErrorPayload
  | SetSwapFromAmountErrorPayload
  | SetSwapToTokenErrorPayload
  | SetSwapToAmountErrorPayload;

export enum SwapFormActions {
  SET_SWAP_FROM_TOKEN = 'SET_SWAP_FROM_TOKEN',
  SET_SWAP_FROM_AMOUNT = 'SET_SWAP_FROM_AMOUNT',
  SET_SWAP_TO_TOKEN = 'SET_SWAP_TO_TOKEN',
  SET_SWAP_TO_AMOUNT = 'SET_SWAP_TO_AMOUNT',
  SET_SWAP_FROM_FIAT_VALUE = 'SET_SWAP_FROM_FIAT_VALUE',
  SET_BLOCK_FETCH_QUOTE = 'SET_BLOCK_FETCH_QUOTE',
  SET_SWAP_FROM_TOKEN_ERROR = 'SET_SWAP_FROM_TOKEN_ERROR',
  SET_SWAP_FROM_AMOUNT_ERROR = 'SET_SWAP_FROM_AMOUNT_ERROR',
  SET_SWAP_TO_TOKEN_ERROR = 'SET_SWAP_TO_TOKEN_ERROR',
  SET_SWAP_TO_AMOUNT_ERROR = 'SET_SWAP_TO_AMOUNT_ERROR',
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
  swapFromToken: GetBalanceResult | null;
}

export interface SetSwapFromAmountPayload {
  type: SwapFormActions.SET_SWAP_FROM_AMOUNT;
  swapFromAmount: string;
}

export interface SetSwapFromFiatValuePayload {
  type: SwapFormActions.SET_SWAP_FROM_FIAT_VALUE;
  swapFromFiatValue: string;
}

export interface SetBlockFetchQuote {
  type: SwapFormActions.SET_BLOCK_FETCH_QUOTE;
  blockFetchQuote: boolean;
}

export interface SetSwapFromTokenErrorPayload {
  type: SwapFormActions.SET_SWAP_FROM_TOKEN_ERROR;
  swapFromTokenError: string;
}

export interface SetSwapFromAmountErrorPayload {
  type: SwapFormActions.SET_SWAP_FROM_AMOUNT_ERROR;
  swapFromAmountError: string;
}

export interface SetSwapToTokenErrorPayload {
  type: SwapFormActions.SET_SWAP_TO_TOKEN_ERROR;
  swapToTokenError: string;
}

export interface SetSwapToAmountErrorPayload {
  type: SwapFormActions.SET_SWAP_TO_AMOUNT_ERROR;
  swapToAmountError: string;
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
    case SwapFormActions.SET_BLOCK_FETCH_QUOTE:
      return {
        ...state,
        blockFetchQuote: action.payload.blockFetchQuote,
      };
    case SwapFormActions.SET_SWAP_FROM_TOKEN_ERROR:
      return {
        ...state,
        swapFromTokenError: action.payload.swapFromTokenError,
      };
    case SwapFormActions.SET_SWAP_FROM_AMOUNT_ERROR:
      return {
        ...state,
        swapFromAmountError: action.payload.swapFromAmountError,
      };
    case SwapFormActions.SET_SWAP_TO_TOKEN_ERROR:
      return {
        ...state,
        swapToTokenError: action.payload.swapToTokenError,
      };
    case SwapFormActions.SET_SWAP_TO_AMOUNT_ERROR:
      return {
        ...state,
        swapToAmountError: action.payload.swapToAmountError,
      };
    default:
      return state;
  }
};
