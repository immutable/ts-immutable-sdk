import { Web3Provider } from '@ethersproject/providers';
import { TokenBridge } from '@imtbl/bridge-sdk';
import {
  WalletProviderName,
  GetBalanceResult,
  NetworkInfo,
  TokenInfo,
  Checkout,
} from '@imtbl/checkout-sdk';
import { createContext } from 'react';

export interface XBridgeState {
  checkout: Checkout;
  web3Provider: Web3Provider | null;
  walletProviderName: WalletProviderName | null;
  tokenBridge: TokenBridge | null;
  network: NetworkInfo | null;
  toNetwork: NetworkInfo | null;
  tokenBalances: GetBalanceResult[];
  allowedTokens: TokenInfo[];
  token: TokenInfo | null;
  amount: string;
}

export const initialXBridgeState: Omit<XBridgeState, 'checkout'> = {
  web3Provider: null,
  walletProviderName: null,
  tokenBridge: null,
  network: null,
  toNetwork: null,
  tokenBalances: [],
  allowedTokens: [],
  token: null,
  amount: '0',
};

export interface XBridgeContextState {
  bridgeState: XBridgeState;
  bridgeDispatch: React.Dispatch<BridgeAction>;
}

export interface BridgeAction {
  payload: ActionPayload;
}

type ActionPayload =
  | SetWalletProviderNamePayload
  | SetProviderPayload
  | SetTokenBridgePayload
  | SetNetworkPayload
  | SetToNetworkPayload
  | SetTokenBalancesPayload
  | SetAllowedTokensPayload
  | SetTokenAndAmountPayload;

export enum BridgeActions {
  SET_WALLET_PROVIDER_NAME = 'SET_WALLET_PROVIDER_NAME',
  SET_PROVIDER = 'SET_PROVIDER',
  SET_TOKEN_BRIDGE = 'SET_TOKEN_BRIDGE',
  SET_NETWORK = 'SET_NETWORK',
  SET_TO_NETWORK = 'SET_TO_NETWORK',
  SET_TOKEN_BALANCES = 'SET_TOKEN_BALANCES',
  SET_ALLOWED_TOKENS = 'SET_ALLOWED_TOKENS',
  SET_TOKEN_AND_AMOUNT = 'SET_TOKEN_AND_AMOUNT',
}

export interface SetWalletProviderNamePayload {
  type: BridgeActions.SET_WALLET_PROVIDER_NAME;
  walletProviderName: WalletProviderName;
}

export interface SetProviderPayload {
  type: BridgeActions.SET_PROVIDER;
  web3Provider: Web3Provider;
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

export interface SetTokenAndAmountPayload {
  type: BridgeActions.SET_TOKEN_AND_AMOUNT;
  token: TokenInfo;
  amount: string;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const XBridgeContext = createContext<XBridgeContextState>({
  bridgeState: { ...initialXBridgeState, checkout: {} as Checkout },
  bridgeDispatch: () => {},
});

XBridgeContext.displayName = 'XBridgeContext'; // help with debugging Context in browser

export type Reducer<S, A> = (prevState: S, action: A) => S;

export const xBridgeReducer: Reducer<XBridgeState, BridgeAction> = (
  state: XBridgeState,
  action: BridgeAction,
) => {
  switch (action.payload.type) {
    case BridgeActions.SET_WALLET_PROVIDER_NAME:
      return {
        ...state,
        walletProviderName: action.payload.walletProviderName,
      };
    case BridgeActions.SET_PROVIDER:
      return {
        ...state,
        web3Provider: action.payload.web3Provider,
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
    case BridgeActions.SET_TOKEN_AND_AMOUNT:
      return {
        ...state,
        token: action.payload.token,
        amount: action.payload.amount,
      };
    default:
      return state;
  }
};
