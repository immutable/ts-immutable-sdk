import { Web3Provider } from "@ethersproject/providers";
import { createContext } from "react";

export interface ConnectState {
    provider: Web3Provider | null
}

export const initialState: ConnectState = {
    provider: null
}

export interface ConnectContextState {
    state: ConnectState,
    dispatch: React.Dispatch<Action>,
}

export interface Action {
    payload: ActionPayload
}

type ActionPayload = SetProvider

export enum Actions {
    SET_PROVIDER = "set-provider",
}

export interface SetProvider {
    type: Actions.SET_PROVIDER,
    provider: Web3Provider
}

export const ConnectContext = createContext<ConnectContextState>({
    state: initialState,
    dispatch: () => {},
});

export type Reducer<S, A> = (prevState: S, action: A) => S;

export const connectReducer: Reducer<ConnectState, Action> = (state: ConnectState, action: Action) => {
    switch (action.payload.type) {
        case Actions.SET_PROVIDER:
            return {
                ...state,
                provider: action.payload.provider
            }
        default:
            return state;
    }
}
