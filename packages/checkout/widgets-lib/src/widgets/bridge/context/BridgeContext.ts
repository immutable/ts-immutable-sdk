import { Web3Provider } from '@ethersproject/providers';
import { TokenBridge } from '@imtbl/bridge-sdk';
import {
  Checkout,
  ConnectionProviders,
  GetBalanceResult,
  NetworkInfo,
  TokenInfo,
} from '@imtbl/checkout-sdk';
import { createContext } from 'react';

export interface BridgeState {
  checkout: Checkout | null;
  provider: Web3Provider | null;
  providerPreference: ConnectionProviders | null;
  tokenBridge: TokenBridge | null;
  network: NetworkInfo | null;
  toNetwork: NetworkInfo | null;
  tokenBalances: GetBalanceResult[];
  allowedTokens: TokenInfo[];
}

export const initialBridgeState: BridgeState = {
  checkout: null,
  provider: null,
  providerPreference: null,
  tokenBridge: null,
  network: null,
  toNetwork: null,
  tokenBalances: [],
  allowedTokens: [],
};

export interface BridgeContextState {
  bridgeState: BridgeState;
  bridgeDispatch: React.Dispatch<BridgeAction>;
}

export interface BridgeAction {
  payload: ActionPayload;
}

type ActionPayload =
  | SetCheckoutPayload
  | SetProviderPayload
  | SetProviderPreferencePayload
  | SetTokenBridgePayload
  | SetNetworkPayload
  | SetToNetworkPayload
  | SetTokenBalancesPayload
  | SetAllowedTokensPayload;

export enum BridgeActions {
  SET_CHECKOUT = 'SET_CHECKOUT',
  SET_PROVIDER = 'SET_PROVIDER',
  SET_PROVIDER_PREFERENCE = 'SET_PROVIDER_PREFERENCE',
  SET_TOKEN_BRIDGE = 'SET_TOKEN_BRIDGE',
  SET_NETWORK = 'SET_NETWORK',
  SET_TO_NETWORK = 'SET_TO_NETWORK',
  SET_TOKEN_BALANCES = 'SET_TOKEN_BALANCES',
  SET_ALLOWED_TOKENS = 'SET_ALLOWED_TOKENS',
}

export interface SetCheckoutPayload {
  type: BridgeActions.SET_CHECKOUT;
  checkout: Checkout;
}

export interface SetProviderPayload {
  type: BridgeActions.SET_PROVIDER;
  provider: Web3Provider;
}

export interface SetProviderPreferencePayload {
  type: BridgeActions.SET_PROVIDER_PREFERENCE;
  providerPreference: ConnectionProviders;
}

export interface SetTokenBridgePayload {
  type: BridgeActions.SET_TOKEN_BRIDGE;
  tokenBridge: TokenBridge;
}

export interface SetNetworkPayload {
  type: BridgeActions.SET_NETWORK;
  network: NetworkInfo;
}

export interface SetToNetworkPayload {
  type: BridgeActions.SET_TO_NETWORK;
  toNetwork: NetworkInfo;
}

export interface SetTokenBalancesPayload {
  type: BridgeActions.SET_TOKEN_BALANCES;
  tokenBalances: GetBalanceResult[];
}

export interface SetAllowedTokensPayload {
  type: BridgeActions.SET_ALLOWED_TOKENS;
  allowedTokens: TokenInfo[];
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const BridgeContext = createContext<BridgeContextState>({
  bridgeState: initialBridgeState,
  bridgeDispatch: () => {},
});

BridgeContext.displayName = 'BridgeContext'; // help with debugging Context in browser

export type Reducer<S, A> = (prevState: S, action: A) => S;

export const bridgeReducer: Reducer<BridgeState, BridgeAction> = (
  state: BridgeState,
  action: BridgeAction,
) => {
  switch (action.payload.type) {
    case BridgeActions.SET_CHECKOUT:
      return {
        ...state,
        checkout: action.payload.checkout,
      };
    case BridgeActions.SET_PROVIDER:
      return {
        ...state,
        provider: action.payload.provider,
      };
    case BridgeActions.SET_PROVIDER_PREFERENCE:
      return {
        ...state,
        providerPreference: action.payload.providerPreference,
      };
    case BridgeActions.SET_TOKEN_BRIDGE:
      return {
        ...state,
        tokenBridge: action.payload.tokenBridge,
      };
    case BridgeActions.SET_NETWORK:
      return {
        ...state,
        network: action.payload.network,
      };
    case BridgeActions.SET_TO_NETWORK:
      return {
        ...state,
        toNetwork: action.payload.toNetwork,
      };
    case BridgeActions.SET_TOKEN_BALANCES:
      return {
        ...state,
        tokenBalances: action.payload.tokenBalances,
      };
    case BridgeActions.SET_ALLOWED_TOKENS:
      return {
        ...state,
        allowedTokens: action.payload.allowedTokens,
      };
    default:
      return state;
  }
};
