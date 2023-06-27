import { Web3Provider } from '@ethersproject/providers';
import {
  Checkout,
  WalletProviderName,
  NetworkInfo,
} from '@imtbl/checkout-sdk';
import { createContext } from 'react';
import { BalanceInfo } from '../functions/tokenBalances';

export interface WalletState {
  checkout: Checkout | null;
  provider: Web3Provider | null;
  walletProvider: WalletProviderName | null;
  network: NetworkInfo | null;
  tokenBalances: BalanceInfo[];
  supportedTopUps: TopUpFeature | null;
}

export interface TopUpFeature {
  isOnRampEnabled?: boolean;
  isSwapEnabled?: boolean;
  isBridgeEnabled?: boolean;
}

export const initialWalletState: WalletState = {
  checkout: null,
  provider: null,
  walletProvider: null,
  network: null,
  tokenBalances: [],
  supportedTopUps: null,
};

export interface WalletContextState {
  walletState: WalletState;
  walletDispatch: React.Dispatch<WalletAction>;
}

export interface WalletAction {
  payload: ActionPayload;
}

type ActionPayload =
  | SetCheckoutPayload
  | SetProviderPayload
  | SetWalletProviderPayload
  | SetSwitchNetworkPayload
  | SetTokenBalancesPayload
  | SetSupportedTopUpPayload;

export enum WalletActions {
  SET_CHECKOUT = 'SET_CHECKOUT',
  SET_PROVIDER = 'SET_PROVIDER',
  SET_WALLET_PROVIDER = 'SET_WALLET_PROVIDER',
  SET_NETWORK = 'SET_NETWORK',
  SET_TOKEN_BALANCES = 'SET_TOKEN_BALANCES',
  SET_SUPPORTED_TOP_UPS = 'SUPPORTED_TOP_UPS',
}

export interface SetCheckoutPayload {
  type: WalletActions.SET_CHECKOUT;
  checkout: Checkout;
}

export interface SetProviderPayload {
  type: WalletActions.SET_PROVIDER;
  provider: Web3Provider;
}

export interface SetWalletProviderPayload {
  type: WalletActions.SET_WALLET_PROVIDER;
  walletProvider: WalletProviderName;
}

export interface SetSwitchNetworkPayload {
  type: WalletActions.SET_NETWORK;
  network: NetworkInfo;
}

export interface SetTokenBalancesPayload {
  type: WalletActions.SET_TOKEN_BALANCES;
  tokenBalances: BalanceInfo[];
}

export interface SetSupportedTopUpPayload {
  type: WalletActions.SET_SUPPORTED_TOP_UPS;
  supportedTopUps: TopUpFeature;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const WalletContext = createContext<WalletContextState>({
  walletState: initialWalletState,
  walletDispatch: () => {},
});

WalletContext.displayName = 'WalletContext'; // help with debugging Context in browser

export type Reducer<S, A> = (prevState: S, action: A) => S;

export const walletReducer: Reducer<WalletState, WalletAction> = (
  state: WalletState,
  action: WalletAction,
) => {
  switch (action.payload.type) {
    case WalletActions.SET_CHECKOUT:
      return {
        ...state,
        checkout: action.payload.checkout,
      };
    case WalletActions.SET_PROVIDER:
      return {
        ...state,
        provider: action.payload.provider,
      };
    case WalletActions.SET_WALLET_PROVIDER:
      return {
        ...state,
        walletProvider: action.payload.walletProvider,
      };
    case WalletActions.SET_NETWORK:
      return {
        ...state,
        network: action.payload.network,
      };
    case WalletActions.SET_TOKEN_BALANCES:
      return {
        ...state,
        tokenBalances: action.payload.tokenBalances,
      };
    case WalletActions.SET_SUPPORTED_TOP_UPS:
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
    default:
      return state;
  }
};
