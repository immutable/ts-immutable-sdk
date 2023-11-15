import { WalletProviderName } from '@imtbl/checkout-sdk';
import {
  BridgeActions, SetWalletProviderNamePayload, bridgeReducer, initialBridgeState,
} from './BridgeContext';

describe('BridgeContext', () => {
  it('should update wallet provider name when reducer called with SET_WALLET_PROVIDER_NAME action', () => {
    const setWalletProviderNamePayload: SetWalletProviderNamePayload = {
      type: BridgeActions.SET_WALLET_PROVIDER_NAME,
      walletProviderName: WalletProviderName.METAMASK,
    };

    expect(initialBridgeState.walletProviderName).toEqual(null);
    const { walletProviderName } = bridgeReducer(initialBridgeState, {
      payload: setWalletProviderNamePayload,
    });
    expect(walletProviderName).toEqual(WalletProviderName.METAMASK);
  });
});
