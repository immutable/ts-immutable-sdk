import {
  WidgetEvent,
  SmartEventType,
  SmartSuccess,
  IMTBLWidgetEvents,
  SmartFailed,
} from '@imtbl/checkout-widgets';

export const sendSmartSuccessEvent = (transactionHash: string) => {
  const successEvent = new CustomEvent<WidgetEvent<SmartSuccess>>(
    IMTBLWidgetEvents.IMTBL_SMART_WIDGET_EVENT,
    {
      detail: {
        type: SmartEventType.SUCCESS,
        data: {
          transactionHash,
        },
      },
    },
  );
  // eslint-disable-next-line no-console
  console.log('smart success ', successEvent);
  if (window !== undefined) window.dispatchEvent(successEvent);
};

export const sendSmartFailedEvent = (reason: string) => {
  const failedEvent = new CustomEvent<WidgetEvent<SmartFailed>>(
    IMTBLWidgetEvents.IMTBL_SMART_WIDGET_EVENT,
    {
      detail: {
        type: SmartEventType.FAILURE,
        data: {
          reason,
          timestamp: new Date().getTime(),
        },
      },
    },
  );
  // eslint-disable-next-line no-console
  console.log('smart failed ', failedEvent);
  if (window !== undefined) window.dispatchEvent(failedEvent);
};

export function sendSmartWidgetCloseEvent() {
  const closeWidgetEvent = new CustomEvent<WidgetEvent<any>>(
    IMTBLWidgetEvents.IMTBL_SMART_WIDGET_EVENT,
    {
      detail: {
        type: SmartEventType.CLOSE_WIDGET,
        data: {},
      },
    },
  );
  // eslint-disable-next-line no-console
  console.log('smart close ', closeWidgetEvent);
  if (window !== undefined) window.dispatchEvent(closeWidgetEvent);
}
