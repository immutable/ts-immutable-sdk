import { Checkout, WalletProviderName } from '@imtbl/checkout-sdk';
import {
  BridgeActions, SetWalletProviderNamePayload, initialBridgeState, bridgeReducer,
} from './BridgeContext';

describe('BridgeContext', () => {
  it('should update wallet provider name when reducer called with SET_WALLET_PROVIDER_NAME action', () => {
    const setWalletProviderNamePayload: SetWalletProviderNamePayload = {
      type: BridgeActions.SET_WALLET_PROVIDER_NAME,
      walletProviderName: WalletProviderName.METAMASK,
    };

    const checkout = {} as Checkout;
    const bridgeState = { ...initialBridgeState, checkout };

    expect(initialBridgeState.walletProviderName).toEqual(null);
    const { walletProviderName } = bridgeReducer(bridgeState, {
      payload: setWalletProviderNamePayload,
    });
    expect(walletProviderName).toEqual(WalletProviderName.METAMASK);
  });
});
