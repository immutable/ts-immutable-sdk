import { Web3Provider } from '@ethersproject/providers';
import { NetworkInfo } from '@imtbl/checkout-sdk';
import {
  IMTBLWidgetEvents,
  WidgetEvent,
  WalletEventType,
  WalletNetworkSwitchEvent,
} from '@imtbl/checkout-widgets';

export function sendWalletWidgetCloseEvent() {
  const closeWidgetEvent = new CustomEvent<WidgetEvent<any>>(
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

export function sendNetworkSwitchEvent(provider: Web3Provider, network: NetworkInfo) {
  const walletWidgetSwitchNetworkEvent = new CustomEvent<
  WidgetEvent<WalletNetworkSwitchEvent>
  >(IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT, {
    detail: {
      type: WalletEventType.NETWORK_SWITCH,
      data: {
        network: network.name,
        chainId: network.chainId,
        provider,
      },
    },
  });
  // eslint-disable-next-line no-console
  console.log('switch network event:', walletWidgetSwitchNetworkEvent);
  if (window !== undefined) window.dispatchEvent(walletWidgetSwitchNetworkEvent);
}

export function sendDisconnectWalletEvent() {
  const disconnectWalletEvent = new CustomEvent<WidgetEvent<any>>(
    IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT,
    {
      detail: {
        type: WalletEventType.DISCONNECT_WALLET,
        data: {},
      },
    },
  );
  // eslint-disable-next-line no-console
  console.log('disconnect wallet event:', disconnectWalletEvent);
  if (window !== undefined) window.dispatchEvent(disconnectWalletEvent);
}
