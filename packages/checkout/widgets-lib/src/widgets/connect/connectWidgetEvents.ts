import {
  IMTBLWidgetEvents,
  WidgetEvent,
  ConnectEventType,
  WalletProviderName,
  WidgetType,
} from '@imtbl/checkout-sdk';

import { Web3Provider } from '@ethersproject/providers';

export function sendConnectSuccessEvent(
  eventTarget: Window | EventTarget,
  provider: Web3Provider,
  walletProviderName?: WalletProviderName,
) {
  const successEvent = new CustomEvent<WidgetEvent<WidgetType.CONNECT, ConnectEventType.SUCCESS>>(
    IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT,
    {
      detail: {
        type: ConnectEventType.SUCCESS,
        data: {
          provider,
          walletProviderName,
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
