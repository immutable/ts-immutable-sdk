import { createContext } from 'react';
import { MetaMaskProvider, Environment } from 'ts-immutable-sdk';

export interface AppState {
    metaMaskProvider: MetaMaskProvider | null;
    address: string;
    env: string;
}

export const initialState: AppState = {
    metaMaskProvider: null,
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
    MetaMaskProviderConnected |
    MetaMaskProviderDisconnected

export enum Actions {
    SetEnvironment = "SET_ENVIRONMENT",
    MetaMaskProviderConnected = "METAMASK_PROVIDER_CONNECTED",
    MetaMaskProviderDisconnected = "METAMASK_PROVIDER_DISCONNECTED"
}

export interface SetEnvironment {
    type: Actions.SetEnvironment;
    env: Environment;
}

export interface MetaMaskProviderConnected {
    type: Actions.MetaMaskProviderConnected;
    metaMaskProvider: MetaMaskProvider;
    address: string;
}

export interface MetaMaskProviderDisconnected {
    type: Actions.MetaMaskProviderDisconnected;
}

export const appReducer: Reducer<AppState, Action> = (state: AppState, action: Action) => {
    switch (action.payload.type) {
        case Actions.SetEnvironment:
            return {
                ...state,
                env: action.payload.env
            }
        case Actions.MetaMaskProviderConnected:
            return {
                ...state,
                metaMaskProvider: action.payload.metaMaskProvider,
                address: action.payload.address,
            }
        case Actions.MetaMaskProviderDisconnected:
            return {
                ...state,
                metaMaskProvider: null,
                address: '',
            }
        default:
            return state;
    }
}
