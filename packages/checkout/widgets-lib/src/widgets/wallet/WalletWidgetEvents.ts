import { BrowserProvider } from 'ethers';
import {
  NetworkInfo,
  IMTBLWidgetEvents,
  WidgetEvent,
  WalletEventType,
  WidgetType,
} from '@imtbl/checkout-sdk';

export function sendWalletWidgetCloseEvent(eventTarget: Window | EventTarget) {
  const closeWidgetEvent = new CustomEvent<WidgetEvent<WidgetType.WALLET, WalletEventType.CLOSE_WIDGET>>(
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
  console.log('close widget event:', eventTarget, closeWidgetEvent);
  if (eventTarget !== undefined) eventTarget.dispatchEvent(closeWidgetEvent);
}

export function sendNetworkSwitchEvent(
  eventTarget: Window | EventTarget,
  provider: BrowserProvider,
  network: NetworkInfo,
) {
  const walletWidgetSwitchNetworkEvent = new CustomEvent<
  WidgetEvent<WidgetType.WALLET, WalletEventType.NETWORK_SWITCH>
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
  console.log('switch network event:', eventTarget, walletWidgetSwitchNetworkEvent);
  if (eventTarget !== undefined) eventTarget.dispatchEvent(walletWidgetSwitchNetworkEvent);
}

export function sendDisconnectWalletEvent(eventTarget: Window | EventTarget) {
  const disconnectWalletEvent = new CustomEvent<WidgetEvent<WidgetType.WALLET, WalletEventType.DISCONNECT_WALLET>>(
    IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT,
    {
      detail: {
        type: WalletEventType.DISCONNECT_WALLET,
        data: {},
      },
    },
  );
  // eslint-disable-next-line no-console
  console.log('disconnect wallet event:', eventTarget, disconnectWalletEvent);
  if (eventTarget !== undefined) eventTarget.dispatchEvent(disconnectWalletEvent);
}
