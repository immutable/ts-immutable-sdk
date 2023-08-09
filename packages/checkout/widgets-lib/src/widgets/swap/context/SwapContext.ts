import {
  WalletProviderName,
  GetBalanceResult,
  NetworkInfo,
  TokenInfo,
} from '@imtbl/checkout-sdk';
import { Exchange } from '@imtbl/dex-sdk';
import { createContext } from 'react';

export interface SwapState {
  exchange: Exchange | null;
  walletProvider: WalletProviderName | null;
  network: NetworkInfo | null;
  tokenBalances: GetBalanceResult[];
  supportedTopUps: TopUpFeature | null;
  allowedTokens: TokenInfo[];
}

export interface TopUpFeature {
  isOnRampEnabled?: boolean;
  isSwapEnabled?: boolean;
  isBridgeEnabled?: boolean;
}

export const initialSwapState: SwapState = {
  exchange: null,
  walletProvider: null,
  network: null,
  tokenBalances: [],
  supportedTopUps: null,
  allowedTokens: [],
};

export interface SwapContextState {
  swapState: SwapState;
  swapDispatch: React.Dispatch<SwapAction>;
}

export interface SwapAction {
  payload: ActionPayload;
}

type ActionPayload =
  | SetExchangePayload
  | SetWalletProviderPayload
  | SetNetworkPayload
  | SetSupportedTopUpPayload
  | SetTokenBalancesPayload
  | SetAllowedTokensPayload;

export enum SwapActions {
  SET_EXCHANGE = 'SET_EXCHANGE',
  SET_WALLET_PROVIDER = 'SET_WALLET_PROVIDER',
  SET_NETWORK = 'SET_NETWORK',
  SET_SUPPORTED_TOP_UPS = 'SET_SUPPORTED_TOP_UPS',
  SET_TOKEN_BALANCES = 'SET_TOKEN_BALANCES',
  SET_ALLOWED_TOKENS = 'SET_ALLOWED_TOKENS',
}

export interface SetExchangePayload {
  type: SwapActions.SET_EXCHANGE;
  exchange: Exchange;
}

export interface SetWalletProviderPayload {
  type: SwapActions.SET_WALLET_PROVIDER;
  walletProvider: WalletProviderName;
}

export interface SetNetworkPayload {
  type: SwapActions.SET_NETWORK;
  network: NetworkInfo;
}

export interface SetTokenBalancesPayload {
  type: SwapActions.SET_TOKEN_BALANCES;
  tokenBalances: GetBalanceResult[];
}

export interface SetSupportedTopUpPayload {
  type: SwapActions.SET_SUPPORTED_TOP_UPS;
  supportedTopUps: TopUpFeature;
}

export interface SetAllowedTokensPayload {
  type: SwapActions.SET_ALLOWED_TOKENS;
  allowedTokens: TokenInfo[];
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const SwapContext = createContext<SwapContextState>({
  swapState: initialSwapState,
  swapDispatch: () => {},
});

SwapContext.displayName = 'SwapContext'; // help with debugging Context in browser

export type Reducer<S, A> = (prevState: S, action: A) => S;

export const swapReducer: Reducer<SwapState, SwapAction> = (
  state: SwapState,
  action: SwapAction,
) => {
  switch (action.payload.type) {
    case SwapActions.SET_EXCHANGE:
      return {
        ...state,
        exchange: action.payload.exchange,
      };
    case SwapActions.SET_WALLET_PROVIDER:
      return {
        ...state,
        walletProvider: action.payload.walletProvider,
      };
    case SwapActions.SET_NETWORK:
      return {
        ...state,
        network: action.payload.network,
      };
    case SwapActions.SET_SUPPORTED_TOP_UPS:
      return {
        ...state,
        supportedTopUps: {
          isSwapEnabled: action.payload.supportedTopUps.isSwapEnabled ?? true,
          isOnRampEnabled:
            action.payload.supportedTopUps.isOnRampEnabled ?? true,
          isBridgeEnabled:
            action.payload.supportedTopUps.isBridgeEnabled ?? true,
        },
      };
    case SwapActions.SET_TOKEN_BALANCES:
      return {
        ...state,
        tokenBalances: action.payload.tokenBalances,
      };
    case SwapActions.SET_ALLOWED_TOKENS:
      return {
        ...state,
        allowedTokens: action.payload.allowedTokens,
      };
    default:
      return state;
  }
};
