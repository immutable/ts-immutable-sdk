import {
  IMTBLWidgetEvents, OnRampEventType, OnRampSuccess, WalletEventType, WidgetEvent,
} from '@imtbl/checkout-widgets';
import { OnRampFailed } from '@imtbl/checkout-widgets/src';

export function sendOnRampWidgetCloseEvent() {
  const closeWidgetEvent = new CustomEvent<WidgetEvent<any>>(
    IMTBLWidgetEvents.IMTBL_ONRAMP_WIDGET_EVENT,
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

export const sendOnRampSuccessEvent = (transactionHash: string) => {
  const successEvent = new CustomEvent<WidgetEvent<OnRampSuccess>>(
    IMTBLWidgetEvents.IMTBL_ONRAMP_WIDGET_EVENT,
    {
      detail: {
        type: OnRampEventType.SUCCESS,
        data: {
          transactionHash,
        },
      },
    },
  );
  // eslint-disable-next-line no-console
  console.log('on-ramp success event:', successEvent);
  if (window !== undefined) window.dispatchEvent(successEvent);
};

export const sendOnRampFailedEvent = (reason: string) => {
  const failedEvent = new CustomEvent<WidgetEvent<OnRampFailed>>(
    IMTBLWidgetEvents.IMTBL_ONRAMP_WIDGET_EVENT,
    {
      detail: {
        type: OnRampEventType.FAILURE,
        data: {
          reason,
          timestamp: new Date().getTime(),
        },
      },
    },
  );
  // eslint-disable-next-line no-console
  console.log('on-ramp failed event:', failedEvent);
  if (window !== undefined) window.dispatchEvent(failedEvent);
};
