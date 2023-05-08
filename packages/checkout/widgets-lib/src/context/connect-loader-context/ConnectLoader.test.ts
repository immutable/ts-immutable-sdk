import { describe, expect } from '@jest/globals';
import { ConnectLoaderActions, ConnectionStatus, UpdateConnectionStatusPayload, connectLoaderReducer, initialConnectLoaderState } from './ConnectLoaderContext';

describe('connect-loader-context', () => {
  it('should update connection status when reducer called with UPDATE_CONNECTION_STATUS', () => {
    const updateViewPayload: UpdateConnectionStatusPayload = {
      type: ConnectLoaderActions.UPDATE_CONNECTION_STATUS,
      connectionStatus: ConnectionStatus.CONNECTED_WITH_NETWORK,
    };

    expect(initialConnectLoaderState).toEqual({
      connectionStatus: ConnectionStatus.LOADING,
    });

    const state = connectLoaderReducer(initialConnectLoaderState, { payload: updateViewPayload });
    expect(state).toEqual({
      connectionStatus: ConnectionStatus.CONNECTED_WITH_NETWORK,
    });
  });
});
