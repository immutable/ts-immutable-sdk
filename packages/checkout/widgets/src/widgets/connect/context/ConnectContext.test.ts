import { Web3Provider } from '@ethersproject/providers';
import { Checkout } from '@imtbl/checkout-sdk-web';
import { describe, expect } from '@jest/globals';
import { ConnectActions, connectReducer, initialConnectState, SetCheckoutPayload, SetProviderPayload } from './ConnectContext';

describe('connect-context', () => {
  it('should update state with checkout when reducer called with SET_CHECKOUT action', () => {
    const setCheckoutPayload: SetCheckoutPayload = {
      type: ConnectActions.SET_CHECKOUT,
      checkout: new Checkout()
    }
    expect(initialConnectState.checkout).toBeNull();
    const { checkout } = connectReducer(initialConnectState, { payload: setCheckoutPayload });
    expect(checkout).toBeInstanceOf(Checkout);
  });

  it('should update state with provider when reducer called with SET_PROVIDER action', () => {
    const setProviderPayload: SetProviderPayload = {
      type: ConnectActions.SET_PROVIDER,
      provider: {} as Web3Provider
    }
    expect(initialConnectState.provider).toBeNull();
    const { provider } = connectReducer(initialConnectState, { payload: setProviderPayload });
    expect(provider).not.toBeNull();
  });
});
