import {
  IMTBLWidgetEvents,
  ConnectEvent,
  ConnectionSuccess,
  ConnectionFailed,
  ConnectEventType,
} from '@imtbl/checkout-widgets';

import { Web3Provider } from '@ethersproject/providers';

import { addToLocalStorage } from '../../lib';

export function sendConnectSuccessEvent(
  provider?: Web3Provider,
) {
  addToLocalStorage('provider', provider);
  const successEvent = new CustomEvent<ConnectEvent<ConnectionSuccess>>(
    IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT,
    {
      detail: {
        type: ConnectEventType.SUCCESS,
        data: {
          provider,
        },
      },
    },
  );
  if (window !== undefined) window.dispatchEvent(successEvent);
}

export function sendCloseWidgetEvent() {
  const closeWidgetEvent = new CustomEvent<ConnectEvent<any>>(
    IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT,
    {
      detail: {
        type: ConnectEventType.CLOSE_WIDGET,
        data: {},
      },
    },
  );
  if (window !== undefined) window.dispatchEvent(closeWidgetEvent);
}

export function sendConnectFailedEvent(reason: string) {
  const failedEvent = new CustomEvent<ConnectEvent<ConnectionFailed>>(
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
  if (window !== undefined) window.dispatchEvent(failedEvent);
}
