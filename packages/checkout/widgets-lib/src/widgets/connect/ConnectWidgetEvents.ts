import {
  IMTBLWidgetEvents,
  WidgetEvent,
  ConnectionSuccess,
  ConnectionFailed,
  ConnectEventType,
} from '@imtbl/checkout-widgets';

import { ConnectionProviders } from '@imtbl/checkout-sdk';

import { addToLocalStorage } from '../../lib';

export function sendConnectSuccessEvent(
  providerPreference: ConnectionProviders,
) {
  addToLocalStorage('providerPreference', providerPreference);
  const successEvent = new CustomEvent<WidgetEvent<ConnectionSuccess>>(
    IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT,
    {
      detail: {
        type: ConnectEventType.SUCCESS,
        data: {
          providerPreference,
        },
      },
    },
  );
  // eslint-disable-next-line no-console
  console.log('success event:', successEvent);
  if (window !== undefined) window.dispatchEvent(successEvent);
}

export function sendCloseWidgetEvent() {
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
  console.log('close event:', closeWidgetEvent);
  if (window !== undefined) window.dispatchEvent(closeWidgetEvent);
}

export function sendConnectFailedEvent(reason: string) {
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
  if (window !== undefined) window.dispatchEvent(failedEvent);
}
