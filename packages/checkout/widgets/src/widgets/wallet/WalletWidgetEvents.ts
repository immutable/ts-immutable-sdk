import { NetworkInfo } from '@imtbl/checkout-sdk-web';
import {
  IMTBLWidgetEvents,
  WalletEvent,
  WalletEventType,
  WalletNetworkSwitchEvent,
} from '@imtbl/checkout-ui-types';

export function sendWalletWidgetCloseEvent() {
  console.log(WalletEventType.CLOSE_WIDGET);
  const closeWidgetEvent = new CustomEvent<WalletEvent<any>>(
    IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT,
    {
      detail: {
        type: WalletEventType.CLOSE_WIDGET,
        data: {},
      },
    }
  );
  console.log('in send close widget event:', closeWidgetEvent);
  if (window !== undefined) window.dispatchEvent(closeWidgetEvent);
}

export function sendNetworkSwitchEvent(network: NetworkInfo) {
  const successWalletWidgetEvent = new CustomEvent<
    WalletEvent<WalletNetworkSwitchEvent>
  >(IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT, {
    detail: {
      type: WalletEventType.NETWORK_SWITCH,
      data: {
        network: network.name,
        chainId: network.chainId,
      },
    },
  });
  console.log('in send success widget event:', successWalletWidgetEvent);
  if (window !== undefined) window.dispatchEvent(successWalletWidgetEvent);
}
