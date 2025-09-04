import {
  WalletProviderName,
  GetBalanceResult,
  NetworkInfo,
  TokenInfo,
  SwapDirection,
} from '@imtbl/checkout-sdk';
import { Exchange } from '@imtbl/dex-sdk';
import { createContext } from 'react';

export interface SwapState {
  exchange: Exchange | null;
  walletProviderName: WalletProviderName | null;
  network: NetworkInfo | null;
  tokenBalances: GetBalanceResult[];
  supportedTopUps: TopUpFeature | null;
  allowedTokens: TokenInfo[];
  autoProceed: boolean;
}

export interface TopUpFeature {
  isOnRampEnabled?: boolean;
  isSwapEnabled?: boolean;
  isBridgeEnabled?: boolean;
}

export const initialSwapState: SwapState = {
  exchange: null,
  walletProviderName: null,
  network: null,
  tokenBalances: [],
  supportedTopUps: null,
  allowedTokens: [],
  autoProceed: false,
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
  | SetWalletProviderNamePayload
  | SetNetworkPayload
  | SetSupportedTopUpPayload
  | SetTokenBalancesPayload
  | SetAllowedTokensPayload
  | SetAutoProceedPayload;

export enum SwapActions {
  SET_EXCHANGE = 'SET_EXCHANGE',
  SET_WALLET_PROVIDER_NAME = 'SET_WALLET_PROVIDER_NAME',
  SET_NETWORK = 'SET_NETWORK',
  SET_SUPPORTED_TOP_UPS = 'SET_SUPPORTED_TOP_UPS',
  SET_TOKEN_BALANCES = 'SET_TOKEN_BALANCES',
  SET_ALLOWED_TOKENS = 'SET_ALLOWED_TOKENS',
  SET_AUTO_PROCEED = 'SET_AUTO_PROCEED',
}

export interface SetExchangePayload {
  type: SwapActions.SET_EXCHANGE;
  exchange: Exchange;
}

export interface SetWalletProviderNamePayload {
  type: SwapActions.SET_WALLET_PROVIDER_NAME;
  walletProviderName: WalletProviderName;
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

export interface SetAutoProceedPayload {
  type: SwapActions.SET_AUTO_PROCEED;
  autoProceed: boolean;
  direction: SwapDirection;
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
    case SwapActions.SET_WALLET_PROVIDER_NAME:
      return {
        ...state,
        walletProviderName: action.payload.walletProviderName,
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
    case SwapActions.SET_AUTO_PROCEED:
      return {
        ...state,
        autoProceed: action.payload.autoProceed,
        direction: action.payload.direction,
      };
    default:
      return state;
  }
};
