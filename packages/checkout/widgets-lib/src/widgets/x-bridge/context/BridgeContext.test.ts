import { Checkout, WalletProviderName } from '@imtbl/checkout-sdk';
import {
  BridgeActions, SetWalletProviderNamePayload, initialXBridgeState, xBridgeReducer,
} from './XBridgeContext';

describe('BridgeContext', () => {
  it('should update wallet provider name when reducer called with SET_WALLET_PROVIDER_NAME action', () => {
    const setWalletProviderNamePayload: SetWalletProviderNamePayload = {
      type: BridgeActions.SET_WALLET_PROVIDER_NAME,
      walletProviderName: WalletProviderName.METAMASK,
    };

    const checkout = {} as Checkout;
    const bridgeState = { ...initialXBridgeState, checkout };

    expect(initialXBridgeState.walletProviderName).toEqual(null);
    const { walletProviderName } = xBridgeReducer(bridgeState, {
      payload: setWalletProviderNamePayload,
    });
    expect(walletProviderName).toEqual(WalletProviderName.METAMASK);
  });
});
