import { createContext } from 'react';
import { MetaMaskIMXProvider, Environment } from 'ts-immutable-sdk';

export interface AppState {
    metaMaskIMXProvider: MetaMaskIMXProvider | null;
    address: string;
    signedMessage: string;
    env: string;
}

export const initialState: AppState = {
    metaMaskIMXProvider: null,
    address: '',
    signedMessage: '',
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
    MetaMaskIMXProviderDisconnected |
    MetaMaskIMXProviderSignMessage

export enum Actions {
    SetEnvironment = "SET_ENVIRONMENT",
    MetaMaskIMXProviderConnected = "METAMASK_IMX_PROVIDER_CONNECTED",
    MetaMaskIMXProviderDisconnected = "METAMASK_IMX_PROVIDER_DISCONNECTED",
    MetaMaskIMXProviderSignMessage = "METAMASK_IMX_PROVIDER_SIGN_MESSAGE"
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

export interface MetaMaskIMXProviderSignMessage {
    type: Actions.MetaMaskIMXProviderSignMessage;
    signedMessage: string;
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
                signedMessage: '',
            }
        case Actions.MetaMaskIMXProviderSignMessage:
            return {
                ...state,
                signedMessage: action.payload.signedMessage,
            }
        default:
            return state;
    }
}
