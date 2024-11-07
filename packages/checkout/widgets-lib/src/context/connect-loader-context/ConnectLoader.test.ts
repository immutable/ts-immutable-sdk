import { describe, expect } from '@jest/globals';
import { Checkout } from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import {
  ConnectLoaderActions,
  ConnectionStatus,
  SetCheckoutPayload,
  SetProviderPayload,
  UpdateConnectionStatusPayload,
  connectLoaderReducer,
  initialConnectLoaderState,
} from './ConnectLoaderContext';
import { BrowserProvider } from 'ethers';

describe('connect-loader-context', () => {
  it('should update connection status when reducer called with UPDATE_CONNECTION_STATUS', () => {
    const updateViewPayload: UpdateConnectionStatusPayload = {
      type: ConnectLoaderActions.UPDATE_CONNECTION_STATUS,
      connectionStatus: ConnectionStatus.CONNECTED_WITH_NETWORK,
    };

    expect(initialConnectLoaderState).toEqual({
      connectionStatus: ConnectionStatus.LOADING,
    });

    const state = connectLoaderReducer(initialConnectLoaderState, {
      payload: updateViewPayload,
    });
    expect(state).toEqual({
      connectionStatus: ConnectionStatus.CONNECTED_WITH_NETWORK,
    });
  });

  it('should update state with checkout when reducer called with SET_CHECKOUT action', () => {
    const setCheckoutPayload: SetCheckoutPayload = {
      type: ConnectLoaderActions.SET_CHECKOUT,
      checkout: new Checkout({
        baseConfig: { environment: Environment.SANDBOX },
      }),
    };
    expect(initialConnectLoaderState.checkout).toBeUndefined();
    const { checkout } = connectLoaderReducer(initialConnectLoaderState, {
      payload: setCheckoutPayload,
    });
    expect(checkout).toBeInstanceOf(Checkout);
  });

  it('should update state with provider when reducer called with SET_PROVIDER action', () => {
    const setProviderPayload: SetProviderPayload = {
      type: ConnectLoaderActions.SET_PROVIDER,
      provider: {} as BrowserProvider,
    };
    expect(initialConnectLoaderState.provider).toBeUndefined();
    const { provider } = connectLoaderReducer(initialConnectLoaderState, {
      payload: setProviderPayload,
    });
    expect(provider).toBeDefined();
  });
});
