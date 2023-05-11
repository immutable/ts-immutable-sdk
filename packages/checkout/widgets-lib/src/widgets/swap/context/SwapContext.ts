import { Web3Provider } from '@ethersproject/providers';
import {
  Checkout,
  ConnectionProviders,
  NetworkInfo,
  TokenInfo,
} from '@imtbl/checkout-sdk';
import { createContext } from 'react';

export interface SwapState {
  checkout: Checkout | null;
  provider: Web3Provider | null;
  providerPreference: ConnectionProviders | null;
  network: NetworkInfo | null;
  tokenBalances: any[];
  supportedTopUps: TopUpFeature | null;
  allowedTokens: TokenInfo[]
}

export interface TopUpFeature {
  isOnRampEnabled?: boolean;
  isSwapEnabled?: boolean;
  isBridgeEnabled?: boolean;
}

export const initialSwapState: SwapState = {
  checkout: null,
  provider: null,
  providerPreference: null,
  network: null,
  tokenBalances: [],
  supportedTopUps: null,
  allowedTokens: []
};

export interface SwapContextState {
  swapState: SwapState;
  swapDispatch: React.Dispatch<SwapAction>;
}

export interface SwapAction {
  payload: ActionPayload;
}

type ActionPayload =
  | SetCheckoutPayload
  | SetProviderPayload
  | SetProviderPreferencePayload
  | SetSwitchNetworkPayload
  | SetSupportedTopUpPayload
  | SetTokenBalancesPayload
  | SetAllowedTokensPayload;

export enum SwapActions {
  SET_CHECKOUT = 'SET_CHECKOUT',
  SET_PROVIDER = 'SET_PROVIDER',
  SET_PROVIDER_PREFERENCE = 'SET_PROVIDER_PREFERENCE',
  SET_NETWORK = 'SET_NETWORK',
  SET_SUPPORTED_TOP_UPS = 'SET_SUPPORTED_TOP_UPS',
  SET_TOKEN_BALANCES = 'SET_TOKEN_BALANCES',
  SET_ALLOWED_TOKENS = 'SET_ALLOWED_TOKENS'
}

export interface SetCheckoutPayload {
  type: SwapActions.SET_CHECKOUT;
  checkout: Checkout;
}

export interface SetProviderPayload {
  type: SwapActions.SET_PROVIDER;
  provider: Web3Provider;
}

export interface SetProviderPreferencePayload {
  type: SwapActions.SET_PROVIDER_PREFERENCE;
  providerPreference: ConnectionProviders;
}

export interface SetSwitchNetworkPayload {
  type: SwapActions.SET_NETWORK;
  network: NetworkInfo;
  tokenBalances: any[];
}

export interface SetTokenBalancesPayload {
  type: SwapActions.SET_TOKEN_BALANCES;
  tokenBalances: any[];
}

export interface SetSupportedTopUpPayload {
  type: SwapActions.SET_SUPPORTED_TOP_UPS;
  supportedTopUps: TopUpFeature;
}

export interface SetAllowedTokensPayload {
  type: SwapActions.SET_ALLOWED_TOKENS;
  allowedTokens: TokenInfo[];
}

export const SwapContext = createContext<SwapContextState>({
  swapState: initialSwapState,
  swapDispatch: () => {},
});

export type Reducer<S, A> = (prevState: S, action: A) => S;

export const swapReducer: Reducer<SwapState, SwapAction> = (
  state: SwapState,
  action: SwapAction
) => {
  switch (action.payload.type) {
    case SwapActions.SET_CHECKOUT:
      return {
        ...state,
        checkout: action.payload.checkout,
      };
    case SwapActions.SET_PROVIDER:
      return {
        ...state,
        provider: action.payload.provider,
      };
    case SwapActions.SET_PROVIDER_PREFERENCE:
      return {
        ...state,
        providerPreference: action.payload.providerPreference,
      };
    case SwapActions.SET_NETWORK:
      return {
        ...state,
        network: action.payload.network,
        tokenBalances: action.payload.tokenBalances,
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
        tokenBalances: action.payload.tokenBalances
      }
    case SwapActions.SET_ALLOWED_TOKENS:
      return {
        ...state,
        allowedTokens: action.payload.allowedTokens
      }
    default:
      return state;
  }
};
