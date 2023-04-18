import { Web3Provider } from '@ethersproject/providers';
import { Checkout } from '@imtbl/checkout-sdk-web';
import { describe, expect } from '@jest/globals';
import { Actions, connectReducer, initialConnectState, SetCheckoutPayload, SetProviderPayload } from './ConnectContext';

describe('connect-context', () => {
  it('should update state with checkout when reducer called with SET_CHECKOUT action', () => {
    const setCheckoutPayload: SetCheckoutPayload = {
      type: Actions.SET_CHECKOUT,
      checkout: new Checkout()
    }
    expect(initialConnectState.checkout).toBeNull();
    const { checkout } = connectReducer(initialConnectState, { payload: setCheckoutPayload });
    expect(checkout).toBeInstanceOf(Checkout);
  });

  it('should update state with provider when reducer called with SET_PROVIDER action', () => {
    const SetProviderPayload: SetProviderPayload = {
      type: Actions.SET_PROVIDER,
      provider: {} as Web3Provider
    }
    expect(initialConnectState.provider).toBeNull();
    const { provider } = connectReducer(initialConnectState, { payload: SetProviderPayload });
    expect(provider).not.toBeNull();
  });
});
