import { NetworkInfo } from '@imtbl/checkout-sdk';
import {
  IMTBLWidgetEvents,
  WalletEvent,
  WalletEventType,
  WalletNetworkSwitchEvent,
} from '@imtbl/checkout-widgets';

export function sendWalletWidgetCloseEvent() {
  const closeWidgetEvent = new CustomEvent<WalletEvent<any>>(
    IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT,
    {
      detail: {
        type: WalletEventType.CLOSE_WIDGET,
        data: {},
      },
    },
  );
  // TODO: please remove or if necessary keep the eslint ignore
  // eslint-disable-next-line no-console
  console.log('close widget event:', closeWidgetEvent);
  if (window !== undefined) window.dispatchEvent(closeWidgetEvent);
}

export function sendNetworkSwitchEvent(network: NetworkInfo) {
  const walletWidgetSwitchNetworkEvent = new CustomEvent<
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
  // eslint-disable-next-line no-console
  console.log('switch network event:', walletWidgetSwitchNetworkEvent);
  if (window !== undefined) window.dispatchEvent(walletWidgetSwitchNetworkEvent);
}
