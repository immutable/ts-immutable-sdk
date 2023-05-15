import { createContext } from 'react';

export interface SwapFormState {
  swapTo: string;
  swapToAmount: string;
  swapFrom: string;
  swapFromAmount: string;
}

export const initialSwapFormState: SwapFormState = {
  swapTo: '',
  swapToAmount: '',
  swapFrom: '',
  swapFromAmount: '',
};

export interface SwapFormContextState {
  swapFormState: SwapFormState;
  swapFormDispatch: React.Dispatch<SwapFormAction>;
}

export interface SwapFormAction {
  payload: ActionPayload;
}

type ActionPayload =
  | SetSwapToPayload

export enum SwapFormActions {
  SET_SWAP_TO = 'SET_SWAP_TO',
  SET_SWAP_TO_AMOUNT = 'SET_SWAP_TO_AMOUNT',
  SET_SWAP_FROM = 'SET_SWAP_FROM',
  SET_SWAP_FROM_AMOUNT = 'SET_SWAP_FROM_AMOUNT',
}

export interface SetSwapToPayload {
  type: SwapFormActions.SET_SWAP_TO;
  swapTo: string;
}

export interface SetSwapFromPayload {
  type: SwapFormActions.SET_SWAP_FROM;
  swapFrom: string;
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
    case SwapFormActions.SET_SWAP_TO:
      return {
        ...state,
        swapTo: action.payload.swapTo,
      };
    default:
      return state;
  }
};
