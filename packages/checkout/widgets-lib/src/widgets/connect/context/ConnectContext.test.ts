import { Web3Provider } from '@ethersproject/providers';
import { Checkout } from '@imtbl/checkout-sdk';
import { describe, expect } from '@jest/globals';
import {
  ConnectActions,
  connectReducer,
  initialConnectState,
  SetCheckoutPayload,
  SetProviderPayload,
  SetSendCloseEventPayload,
} from './ConnectContext';
import { Environment } from '@imtbl/config';

describe('connect-context', () => {
  it('should update state with checkout when reducer called with SET_CHECKOUT action', () => {
    const setCheckoutPayload: SetCheckoutPayload = {
      type: ConnectActions.SET_CHECKOUT,
      checkout: new Checkout({baseConfig: {environment: Environment.PRODUCTION}}),
    };
    expect(initialConnectState.checkout).toBeNull();
    const { checkout } = connectReducer(initialConnectState, {
      payload: setCheckoutPayload,
    });
    expect(checkout).toBeInstanceOf(Checkout);
  });

  it('should update state with provider when reducer called with SET_PROVIDER action', () => {
    const setProviderPayload: SetProviderPayload = {
      type: ConnectActions.SET_PROVIDER,
      provider: {} as Web3Provider,
    };
    expect(initialConnectState.provider).toBeNull();
    const { provider } = connectReducer(initialConnectState, {
      payload: setProviderPayload,
    });
    expect(provider).not.toBeNull();
  });

  it('should update state with send close function when reducer called with SET_SEND_CLOSE_EVENT action', () => {
    const newSendCloseEvent = () => {
      console.log('Send close event');
    };
    const SetSendCloseEventPayload: SetSendCloseEventPayload = {
      type: ConnectActions.SET_SEND_CLOSE_EVENT,
      sendCloseEvent: newSendCloseEvent,
    };
    const { sendCloseEvent } = connectReducer(initialConnectState, {
      payload: SetSendCloseEventPayload,
    });
    expect(sendCloseEvent).toEqual(newSendCloseEvent);
  });
});
