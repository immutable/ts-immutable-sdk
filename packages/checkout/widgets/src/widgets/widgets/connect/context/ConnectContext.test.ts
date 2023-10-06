import { Web3Provider } from '@ethersproject/providers';
import { Checkout, WalletProviderName } from '@imtbl/checkout-sdk';
import { describe, expect } from '@jest/globals';
import { Environment } from '@imtbl/config';
import {
  ConnectActions,
  connectReducer,
  initialConnectState,
  SetCheckoutPayload,
  SetProviderNamePayload,
  SetProviderPayload,
  SetSendCloseEventPayload,
} from './ConnectContext';

describe('connect-context', () => {
  it('should update state with checkout when reducer called with SET_CHECKOUT action', () => {
    const setCheckoutPayload: SetCheckoutPayload = {
      type: ConnectActions.SET_CHECKOUT,
      checkout: new Checkout({
        baseConfig: { environment: Environment.SANDBOX },
      }),
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

  it('should update state with checkout when reducer called with SET_WALLET_PROVIDER_NAME action', () => {
    const setProviderNamePayload: SetProviderNamePayload = {
      type: ConnectActions.SET_WALLET_PROVIDER_NAME,
      walletProviderName: WalletProviderName.METAMASK,
    };
    expect(initialConnectState.checkout).toBeNull();
    const { walletProviderName } = connectReducer(initialConnectState, {
      payload: setProviderNamePayload,
    });
    expect(walletProviderName).toEqual(WalletProviderName.METAMASK);
  });

  it('should update state with send close function when reducer called with SET_SEND_CLOSE_EVENT action', () => {
    const newSendCloseEvent = () => {
      // TODO: Should this this be removed?
      // eslint-disable-next-line no-console
      console.log('Send close event');
    };
    const setSendCloseEventPayload: SetSendCloseEventPayload = {
      type: ConnectActions.SET_SEND_CLOSE_EVENT,
      sendCloseEvent: newSendCloseEvent,
    };
    const { sendCloseEvent } = connectReducer(initialConnectState, {
      payload: setSendCloseEventPayload,
    });
    expect(sendCloseEvent).toEqual(newSendCloseEvent);
  });
});
