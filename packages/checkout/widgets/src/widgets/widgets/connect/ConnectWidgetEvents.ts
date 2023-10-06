import { Web3Provider } from '@ethersproject/providers';
import { WalletProviderName } from '@imtbl/checkout-sdk';
import {
  ConnectionSuccess,
  ConnectionFailed,
  ConnectEventType,
} from '../../../definitions/events/connectEvents';
import {
  IMTBLWidgetEvents,
  WidgetEvent,
} from '../../../definitions/events/events';

export function sendConnectSuccessEvent(
  eventTarget: Window | EventTarget,
  provider: Web3Provider,
  walletProvider?: WalletProviderName,
) {
  const successEvent = new CustomEvent<WidgetEvent<ConnectionSuccess>>(
    IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT,
    {
      detail: {
        type: ConnectEventType.SUCCESS,
        data: {
          provider,
          walletProvider,
        },
      },
    },
  );
  // eslint-disable-next-line no-console
  console.log('success event:', eventTarget, successEvent);
  if (eventTarget !== undefined) eventTarget.dispatchEvent(successEvent);
}

export function sendCloseWidgetEvent(eventTarget: Window | EventTarget) {
  const closeWidgetEvent = new CustomEvent<WidgetEvent<any>>(
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
  const failedEvent = new CustomEvent<WidgetEvent<ConnectionFailed>>(
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
