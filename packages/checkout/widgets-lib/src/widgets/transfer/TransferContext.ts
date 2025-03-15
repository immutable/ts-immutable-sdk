import { GetBalanceResult, TokenInfo } from '@imtbl/checkout-sdk';
import { createContext, useContext, Reducer } from 'react';

interface TransferState {
  tokenBalances: GetBalanceResult[];
  allowedTokens: TokenInfo[];
}

interface SetTokenBalancesPayload {
  type: TransferActions.SET_TOKEN_BALANCES;
  tokenBalances: GetBalanceResult[];
}

export const initialTransferState: TransferState = {
  tokenBalances: [],
  allowedTokens: [],
};

type ActionPayload = SetTokenBalancesPayload;

interface TransferContextState {
  transferState: TransferState;
  transferDispatch: React.Dispatch<TransferAction>;
}

interface TransferAction {
  payload: ActionPayload;
}

export enum TransferActions {
  SET_TOKEN_BALANCES = 'SET_TOKEN_BALANCES',
}

const transferContext = createContext<TransferContextState | null>(null);

export const TransferContextProvider = transferContext.Provider;

export const useTransferContext = () => {
  const context = useContext(transferContext);
  if (!context) {
    throw new Error('useTransferContext must be used within a TransferContextProvider');
  }
  return context;
};

export const transferReducer: Reducer<TransferState, TransferAction> = (state, action) => {
  switch (action.payload.type) {
    case TransferActions.SET_TOKEN_BALANCES:
      return {
        ...state,
        tokenBalances: action.payload.tokenBalances,
      };
    default:
      return state;
  }
};
