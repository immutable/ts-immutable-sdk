import {
  IMTBLWidgetEvents,
  WidgetEvent,
  ConnectEventType,
  WalletProviderName,
  WidgetType,
  WalletConnectManager,
  EIP6963ProviderInfo,
} from '@imtbl/checkout-sdk';

import { BrowserProvider } from 'ethers';
import EthereumProvider from '@walletconnect/ethereum-provider';

export function sendConnectSuccessEvent(
  eventTarget: Window | EventTarget,
  provider: BrowserProvider,
  walletProviderName?: WalletProviderName,
  walletProviderInfo?: EIP6963ProviderInfo,
) {
  const successEvent = new CustomEvent<WidgetEvent<WidgetType.CONNECT, ConnectEventType.SUCCESS>>(
    IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT,
    {
      detail: {
        type: ConnectEventType.SUCCESS,
        data: {
          provider,
          walletProviderName,
          walletProviderInfo,
        },
      },
    },
  );
  // eslint-disable-next-line no-console
  console.log('success event:', eventTarget, successEvent);
  if (eventTarget !== undefined) eventTarget.dispatchEvent(successEvent);
}

export function sendCloseWidgetEvent(eventTarget: Window | EventTarget) {
  const closeWidgetEvent = new CustomEvent<WidgetEvent<WidgetType.CONNECT, ConnectEventType.CLOSE_WIDGET>>(
    IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT,
    {
      detail: {
        type: ConnectEventType.CLOSE_WIDGET,
        data: {},
      },
    },
  );
  // eslint-disable-next-line no-console
  console.log('close event:', eventTarget, closeWidgetEvent);
  if (eventTarget !== undefined) eventTarget.dispatchEvent(closeWidgetEvent);
}

export function sendConnectFailedEvent(eventTarget: Window | EventTarget, reason: string) {
  const failedEvent = new CustomEvent<WidgetEvent<WidgetType.CONNECT, ConnectEventType.FAILURE>>(
    IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT,
    {
      detail: {
        type: ConnectEventType.FAILURE,
        data: {
          reason,
        },
      },
    },
  );
  // eslint-disable-next-line no-console
  console.log('failed event:', eventTarget, failedEvent);
  if (eventTarget !== undefined) eventTarget.dispatchEvent(failedEvent);
}

export function sendWalletConnectProviderUpdatedEvent(
  eventTarget: Window | EventTarget,
  ethereumProvider: EthereumProvider | null,
  walletConnectManager: WalletConnectManager,
) {
  const successEvent = new CustomEvent<
  WidgetEvent<WidgetType.CONNECT, ConnectEventType.WALLETCONNECT_PROVIDER_UPDATED>
  >(
    IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT,
    {
      detail: {
        type: ConnectEventType.WALLETCONNECT_PROVIDER_UPDATED,
        data: {
          ethereumProvider,
          walletConnectManager,
        },
      },
    },
  );
  if (eventTarget !== undefined) eventTarget.dispatchEvent(successEvent);
}
