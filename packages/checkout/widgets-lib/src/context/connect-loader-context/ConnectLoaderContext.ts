import { createContext } from 'react';
import { ConnectWidgetViews } from '../view-context/ConnectViewContextTypes';

export enum ConnectionStatus {
  NOT_CONNECTED_NO_PROVIDER = 'NOT_CONNECTED_NO_PROVIDER',
  NOT_CONNECTED = 'NOT_CONNECTED',
  CONNECTED_WRONG_NETWORK = 'CONNECTED_WRONG_NETWORK',
  CONNECTED_WITH_NETWORK = 'CONNECTED_WITH_NETWORK',
  ERROR = 'ERROR',
  LOADING = 'LOADING',
}

export interface ConnectLoaderState {
  connectionStatus: ConnectionStatus;
  deepLink?: ConnectWidgetViews;
}

export const initialConnectLoaderState: ConnectLoaderState = {
  connectionStatus: ConnectionStatus.LOADING,
};

export interface ConnectLoaderContextState {
  connectLoaderState: ConnectLoaderState;
  connectLoaderDispatch: React.Dispatch<ConnectLoaderAction>;
}

export interface ConnectLoaderAction {
  payload: ConnectLoaderActionPayload;
}

type ConnectLoaderActionPayload = UpdateConnectionStatusPayload;

export enum ConnectLoaderActions {
  UPDATE_CONNECTION_STATUS = 'UPDATE_CONNECTION_STATUS',
}

export interface UpdateConnectionStatusPayload {
  type: ConnectLoaderActions.UPDATE_CONNECTION_STATUS;
  connectionStatus: ConnectionStatus;
  deepLink?: ConnectWidgetViews;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ConnectLoaderContext = createContext<ConnectLoaderContextState>({
  connectLoaderState: initialConnectLoaderState,
  connectLoaderDispatch: () => {},
});

export type Reducer<S, A> = (prevState: S, action: A) => S;

export const connectLoaderReducer: Reducer<
ConnectLoaderState,
ConnectLoaderAction
> = (state: ConnectLoaderState, action: ConnectLoaderAction) => {
  switch (action.payload.type) {
    case ConnectLoaderActions.UPDATE_CONNECTION_STATUS:
      return {
        ...state,
        connectionStatus: action.payload.connectionStatus,
        deepLink: action.payload.deepLink,
      };
    default:
      return state;
  }
};
