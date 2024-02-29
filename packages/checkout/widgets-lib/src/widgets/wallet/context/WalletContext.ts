import {
  WalletProviderName,
  NetworkInfo,
  GetBalanceResult,
} from '@imtbl/checkout-sdk';
import { createContext } from 'react';

export type WalletConfiguration = {
  showDisconnectButton: boolean;
  showNetworkMenu: boolean;
};

export interface WalletState {
  walletProviderName: WalletProviderName | null;
  network: NetworkInfo | null;
  tokenBalances: GetBalanceResult[];
  supportedTopUps: TopUpFeature | null;
  walletConfig: WalletConfiguration;
}

export interface TopUpFeature {
  isOnRampEnabled?: boolean;
  isSwapEnabled?: boolean;
  isBridgeEnabled?: boolean;
  isSwapAvailable?: boolean;
}

export const initialWalletState: WalletState = {
  walletProviderName: null,
  network: null,
  tokenBalances: [],
  supportedTopUps: null,
  /** initial state gets overriden when reducer set up in WalletWidget.tsx */
  walletConfig: {
    showDisconnectButton: true,
    showNetworkMenu: true,
  },
};

export interface WalletContextState {
  walletState: WalletState;
  walletDispatch: React.Dispatch<WalletAction>;
}

export interface WalletAction {
  payload: ActionPayload;
}

type ActionPayload =
  | SetWalletProviderNamePayload
  | SetSwitchNetworkPayload
  | SetTokenBalancesPayload
  | SetSupportedTopUpPayload;

export enum WalletActions {
  SET_WALLET_PROVIDER_NAME = 'SET_WALLET_PROVIDER_NAME',
  SET_NETWORK = 'SET_NETWORK',
  SET_TOKEN_BALANCES = 'SET_TOKEN_BALANCES',
  SET_SUPPORTED_TOP_UPS = 'SUPPORTED_TOP_UPS',
}

export interface SetWalletProviderNamePayload {
  type: WalletActions.SET_WALLET_PROVIDER_NAME;
  walletProviderName: WalletProviderName;
}

export interface SetSwitchNetworkPayload {
  type: WalletActions.SET_NETWORK;
  network: NetworkInfo;
}

export interface SetTokenBalancesPayload {
  type: WalletActions.SET_TOKEN_BALANCES;
  tokenBalances: GetBalanceResult[];
}

export interface SetSupportedTopUpPayload {
  type: WalletActions.SET_SUPPORTED_TOP_UPS;
  supportedTopUps: TopUpFeature;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const WalletContext = createContext<WalletContextState>({
  walletState: initialWalletState,
  walletDispatch: () => { },
});

WalletContext.displayName = 'WalletContext'; // help with debugging Context in browser

export type Reducer<S, A> = (prevState: S, action: A) => S;

export const walletReducer: Reducer<WalletState, WalletAction> = (
  state: WalletState,
  action: WalletAction,
) => {
  switch (action.payload.type) {
    case WalletActions.SET_WALLET_PROVIDER_NAME:
      return {
        ...state,
        walletProviderName: action.payload.walletProviderName,
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
          isSwapAvailable:
            action.payload.supportedTopUps.isSwapAvailable ?? true,
        },
      };
    default:
      return state;
  }
};
