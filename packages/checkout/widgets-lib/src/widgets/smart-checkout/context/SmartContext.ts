import {
  WalletProviderName,
  GetBalanceResult,
  NetworkInfo,
  TokenInfo,
} from '@imtbl/checkout-sdk';
import { createContext } from 'react';

export interface SmartState {
  walletProvider: WalletProviderName | null;
  network: NetworkInfo | null;
  toNetwork: NetworkInfo | null;
  tokenBalances: GetBalanceResult[];
  allowedTokens: TokenInfo[];
}

export const initialSmartState: SmartState = {
  walletProvider: null,
  network: null,
  toNetwork: null,
  tokenBalances: [],
  allowedTokens: [],
};

export interface SmartContextState {
  smartState: SmartState;
  smartDispatch: React.Dispatch<SmartAction>;
}

export interface SmartAction {
  payload: ActionPayload;
}

type ActionPayload =
  | SetWalletProviderPayload
  | SetNetworkPayload
  | SetToNetworkPayload
  | SetTokenBalancesPayload
  | SetAllowedTokensPayload;

export enum SmartActions {
  SET_WALLET_PROVIDER = 'SET_WALLET_PROVIDER',
  SET_TOKEN_SMART = 'SET_TOKEN_SMART',
  SET_NETWORK = 'SET_NETWORK',
  SET_TO_NETWORK = 'SET_TO_NETWORK',
  SET_TOKEN_BALANCES = 'SET_TOKEN_BALANCES',
  SET_ALLOWED_TOKENS = 'SET_ALLOWED_TOKENS',
}

export interface SetWalletProviderPayload {
  type: SmartActions.SET_WALLET_PROVIDER;
  walletProvider: WalletProviderName;
}

export interface SetNetworkPayload {
  type: SmartActions.SET_NETWORK;
  network: NetworkInfo;
}

export interface SetToNetworkPayload {
  type: SmartActions.SET_TO_NETWORK;
  toNetwork: NetworkInfo;
}

export interface SetTokenBalancesPayload {
  type: SmartActions.SET_TOKEN_BALANCES;
  tokenBalances: GetBalanceResult[];
}

export interface SetAllowedTokensPayload {
  type: SmartActions.SET_ALLOWED_TOKENS;
  allowedTokens: TokenInfo[];
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const SmartContext = createContext<SmartContextState>({
  smartState: initialSmartState,
  smartDispatch: () => {},
});

SmartContext.displayName = 'SmartContext'; // help with debugging Context in browser

export type Reducer<S, A> = (prevState: S, action: A) => S;

export const smartReducer: Reducer<SmartState, SmartAction> = (
  state: SmartState,
  action: SmartAction,
) => {
  switch (action.payload.type) {
    case SmartActions.SET_WALLET_PROVIDER:
      return {
        ...state,
        walletProvider: action.payload.walletProvider,
      };
    case SmartActions.SET_NETWORK:
      return {
        ...state,
        network: action.payload.network,
      };
    case SmartActions.SET_TO_NETWORK:
      return {
        ...state,
        toNetwork: action.payload.toNetwork,
      };
    case SmartActions.SET_TOKEN_BALANCES:
      return {
        ...state,
        tokenBalances: action.payload.tokenBalances,
      };
    case SmartActions.SET_ALLOWED_TOKENS:
      return {
        ...state,
        allowedTokens: action.payload.allowedTokens,
      };
    default:
      return state;
  }
};
