import { createContext } from "react";
import { Web3Provider } from '@ethersproject/providers/lib/web3-provider';
import { ImxSigner } from 'ts-immutable-sdk';
import { Environment } from "../constants";

export interface AppState {
    web3provider: Web3Provider | null,
    imxSigner: ImxSigner | null,
    layer1address: string,
    layer2address: string
    env: string
}

export const initialState: AppState = {
    web3provider: null,
    imxSigner: null,
    layer1address: "",
    layer2address: "",
    env: ""
}

export interface AppContextState {
    state: AppState,
    dispatch: any,
}

export const AppCtx = createContext<AppContextState>({ state: initialState, dispatch: {} });
export type Reducer<S, A> = (prevState: S, action: A) => S;

export interface Action {
    payload: ActionPayload
}

type ActionPayload = 
    SetEnvironment |
    WalletConnected | 
    WalletDisconnected

export enum Actions {
    SetEnvironment = "SET_ENVIRONMENT",
    WalletConnected = "WALLET_CONNECTED",
    WalletDisconnected = "WALLET_DISCONNECTED"
}

export interface SetEnvironment {
    type: Actions.SetEnvironment,
    env: Environment
}

export interface WalletConnected {
    type: Actions.WalletConnected,
    web3provider: Web3Provider,
    imxSigner: ImxSigner,
    layer1address: string,
    layer2address: string
}

export interface WalletDisconnected {
    type: Actions.WalletDisconnected
    metadata: string
}

export const appReducer: Reducer<AppState, Action> = (state: AppState, action: Action) => {
    switch (action.payload.type) {
        case Actions.SetEnvironment:
            return { ...state, env: action.payload.env }
        case Actions.WalletConnected:
            const { web3provider, imxSigner, layer1address, layer2address } = action.payload;
            return { ...state, web3provider, imxSigner, layer1address, layer2address }
        case Actions.WalletDisconnected:
            return { ...state, web3provider: null, imxSigner: null, layer1address: "", layer2address: "" }
        default:
            return state;
    }
}
