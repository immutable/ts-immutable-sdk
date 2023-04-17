import { Web3Provider } from '@ethersproject/providers';
import { Checkout } from '@imtbl/checkout-sdk-web';
import {describe, expect, test} from '@jest/globals';
import { Actions, connectReducer, initialState, SetCheckoutPayload, SetProviderPayload } from './ConnectContext';

describe('connect-context', () => {
  test('when reducer called with SET_CHECKOUT payload > state updated with new checkout', () => {
    const setCheckoutPayload: SetCheckoutPayload = {
      type: Actions.SET_CHECKOUT,
      checkout: new Checkout()
    }
    expect(initialState.checkout).toBeNull();
    const { checkout } = connectReducer(initialState, { payload: setCheckoutPayload });
    expect(checkout).toBeInstanceOf(Checkout);
  });

  test('when reducer called with SET_PROVIDER payload > state updated with new provider', () => {
    const SetProviderPayload: SetProviderPayload = {
      type: Actions.SET_PROVIDER,
      provider: {} as Web3Provider
    }
    expect(initialState.provider).toBeNull();
    const { provider } = connectReducer(initialState, { payload: SetProviderPayload });
    expect(provider).not.toBeNull();
  });
});
