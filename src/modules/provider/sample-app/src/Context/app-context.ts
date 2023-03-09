import { createContext } from 'react';
import { MetaMaskIMXProvider, Environment } from 'ts-immutable-sdk';

export interface AppState {
    metaMaskIMXProvider: MetaMaskIMXProvider | null;
    address: string;
    env: string;
}

export const initialState: AppState = {
    metaMaskIMXProvider: null,
    address: '',
    env: '',
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
    MetaMaskIMXProviderConnected |
    MetaMaskIMXProviderDisconnected

export enum Actions {
    SetEnvironment = "SET_ENVIRONMENT",
    MetaMaskIMXProviderConnected = "METAMASK_PROVIDER_CONNECTED",
    MetaMaskIMXProviderDisconnected = "METAMASK_PROVIDER_DISCONNECTED"
}

export interface SetEnvironment {
    type: Actions.SetEnvironment;
    env: Environment;
}

export interface MetaMaskIMXProviderConnected {
    type: Actions.MetaMaskIMXProviderConnected;
    metaMaskIMXProvider: MetaMaskIMXProvider;
    address: string;
}

export interface MetaMaskIMXProviderDisconnected {
    type: Actions.MetaMaskIMXProviderDisconnected;
}

export const appReducer: Reducer<AppState, Action> = (state: AppState, action: Action) => {
    switch (action.payload.type) {
        case Actions.SetEnvironment:
            return {
                ...state,
                env: action.payload.env
            }
        case Actions.MetaMaskIMXProviderConnected:
            return {
                ...state,
                metaMaskIMXProvider: action.payload.metaMaskIMXProvider,
                address: action.payload.address,
            }
        case Actions.MetaMaskIMXProviderDisconnected:
            return {
                ...state,
                metaMaskIMXProvider: null,
                address: '',
            }
        default:
            return state;
    }
}
