import { createContext } from 'react';
import { ImxSigner, MetaMaskProvider, Environment } from 'ts-immutable-sdk';
import { Web3Provider } from '@ethersproject/providers/lib/web3-provider';

export interface AppState {
    metamaskProvider: MetaMaskProvider | null;
    web3provider: Web3Provider | null;
    imxSigner: ImxSigner | null;
    layer1address: string;
    layer2address: string;
    env: string;
}

export const initialState: AppState = {
    metamaskProvider: null,
    web3provider: null,
    imxSigner: null,
    layer1address: '',
    layer2address: '',
    env: ''
}

export interface AppContextState {
    state: AppState;
    dispatch: React.Dispatch<Action>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const AppCtx = createContext<AppContextState>({ state: initialState, dispatch: () => {} });
export type Reducer<S, A> = (prevState: S, action: A) => S;

export interface Action {
    payload: ActionPayload;
}

type ActionPayload =
    SetEnvironment |
    WalletConnected | 
    WalletDisconnected |
    MetamaskProviderConnected

export enum Actions {
    SetEnvironment = "SET_ENVIRONMENT",
    WalletConnected = "WALLET_CONNECTED",
    WalletDisconnected = "WALLET_DISCONNECTED",
    MetamaskProviderConnected = "METAMASK_PROVIDER_CONNECTED"
}

export interface SetEnvironment {
    type: Actions.SetEnvironment;
    env: Environment;
}

export interface WalletConnected {
    type: Actions.WalletConnected;
    web3provider: Web3Provider;
    imxSigner: ImxSigner;
    layer1address: string;
    layer2address: string;
}

export interface WalletDisconnected {
    type: Actions.WalletDisconnected;
}

export interface MetamaskProviderConnected {
    type: Actions.MetamaskProviderConnected;
    metamaskProvider: MetaMaskProvider;
}

export const appReducer: Reducer<AppState, Action> = (state: AppState, action: Action) => {
    switch (action.payload.type) {
        case Actions.SetEnvironment:
            return {
                ...state,
                env: action.payload.env
            }
        case Actions.WalletConnected:
            return { 
                ...state,
                web3provider: action.payload.web3provider,
                imxSigner: action.payload.imxSigner,
                layer1address: action.payload.layer1address,
                layer2address: action.payload.layer2address,
            }
        case Actions.WalletDisconnected:
            return {
                ...state,
                web3provider: null,
                imxSigner: null,
                layer1address: '',
                layer2address: ''
            }
        case Actions.MetamaskProviderConnected:
            return {
                ...state,
                metamaskProvider: action.payload.metamaskProvider
            }
        default:
            return state;
    }
}
