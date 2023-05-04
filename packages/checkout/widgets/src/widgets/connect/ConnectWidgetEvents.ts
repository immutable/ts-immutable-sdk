import {
  IMTBLWidgetEvents,
  ConnectEvent,
  ConnectionSuccess,
  ConnectionFailed,
  ConnectEventType,
} from '@imtbl/checkout-ui-types';

import { ConnectionProviders } from '@imtbl/checkout-sdk-web';

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
  console.log('connect success event', successEvent);
  if (window !== undefined) window.dispatchEvent(successEvent);
}

export function sendConnectWidgetCloseEvent() {
  const closeWidgetEvent = new CustomEvent<ConnectEvent<any>>(
    IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT,
    {
      detail: {
        type: ConnectEventType.CLOSE_WIDGET,
        data: {},
      },
    }
  );
  console.log('close widget  event', closeWidgetEvent);
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
  console.log('failed event', failedEvent);
  if (window !== undefined) window.dispatchEvent(failedEvent);
}
