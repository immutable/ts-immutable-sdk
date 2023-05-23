import { TokenInfo } from '@imtbl/checkout-sdk';
import { TransactionResponse } from '@imtbl/dex-sdk';
import { createContext } from 'react';

export interface SwapFormState {
  quote: TransactionResponse | null;
  gasFeeValue: string;
  gasFeeToken: TokenInfo | null;
  gasFeeFiatValue: string;
  quoteError: string;
  swapFromFiatValue: string;
}

export const initialSwapFormState: SwapFormState = {
  quote: null,
  gasFeeValue: '',
  gasFeeToken: null,
  gasFeeFiatValue: '',
  quoteError: '',
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
  | SetSwapQuotePayload
  | SetSwapQuoteErrorPayload
  | SetSwapFromFiatValuePayload;

export enum SwapFormActions {
  SET_SWAP_QUOTE = 'SET_SWAP_QUOTE',
  SET_SWAP_QUOTE_ERROR = 'SET_SWAP_QUOTE_ERROR',
  SET_SWAP_FROM_FIAT_VALUE = 'SET_SWAP_FROM_FIAT_VALUE',
}

export interface SetSwapFromFiatValuePayload {
  type: SwapFormActions.SET_SWAP_FROM_FIAT_VALUE;
  swapFromFiatValue: string;
}

export interface SetSwapQuotePayload {
  type: SwapFormActions.SET_SWAP_QUOTE;
  quote: TransactionResponse;
  gasFeeValue: string;
  gasFeeToken: TokenInfo;
  gasFeeFiatValue: string;
}

export interface SetSwapQuoteErrorPayload {
  type: SwapFormActions.SET_SWAP_QUOTE_ERROR;
  quoteError: string;
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
  // console.log(action.payload);
  switch (action.payload.type) {
    case SwapFormActions.SET_SWAP_QUOTE:
      return {
        ...state,
        quote: action.payload.quote,
        gasFeeValue: action.payload.gasFeeValue,
        gasFeeToken: action.payload.gasFeeToken,
        gasFeeFiatValue: action.payload.gasFeeFiatValue,
      };
    case SwapFormActions.SET_SWAP_QUOTE_ERROR:
      return {
        ...state,
        quoteError: action.payload.quoteError,
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
