import {
  IMTBLWidgetEvents,
  ConnectEvent,
  ConnectionSuccess,
  ConnectionFailed,
  ConnectEventType,
} from '@imtbl/checkout-widgets-react';

import { ConnectionProviders } from '@imtbl/checkout-sdk';

import { addToLocalStorage } from '../../lib';

export function sendConnectSuccessEvent(
  providerPreference: ConnectionProviders
) {
  addToLocalStorage('providerPreference', providerPreference);
  const successEvent = new CustomEvent<ConnectEvent<ConnectionSuccess>>(
    IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT,
    {
      detail: {
        type: ConnectEventType.SUCCESS,
        data: {
          providerPreference: providerPreference,
        },
      },
    }
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
    }
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
    }
  );
  if (window !== undefined) window.dispatchEvent(failedEvent);
}
