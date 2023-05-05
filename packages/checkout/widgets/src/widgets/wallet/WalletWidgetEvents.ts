import { NetworkInfo } from '@imtbl/checkout-sdk-web';
import {
  IMTBLWidgetEvents,
  WalletEvent,
  WalletEventType,
  WalletNetworkSwitchEvent,
} from '@imtbl/checkout-ui-types';
import { WalletAddCoinsEvent } from '@imtbl/checkout-ui-types/definitions/events/walletEvents';

export function sendWalletWidgetCloseEvent() {
  const closeWidgetEvent = new CustomEvent<WalletEvent<any>>(
    IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT,
    {
      detail: {
        type: WalletEventType.CLOSE_WIDGET,
        data: {},
      },
    }
  );
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
  console.log('switch network event:', walletWidgetSwitchNetworkEvent);
  if (window !== undefined)
    window.dispatchEvent(walletWidgetSwitchNetworkEvent);
}

export function sendAddCoinsEvent(eventData: WalletAddCoinsEvent) {
  const addCoinsEvent = new CustomEvent<WalletEvent<WalletAddCoinsEvent>>(
    IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT,
    {
      detail: {
        type: WalletEventType.ADD_COINS,
        data: eventData,
      },
    }
  );
  console.log('add coins event:', addCoinsEvent);
  if (window !== undefined) window.dispatchEvent(addCoinsEvent);
}
