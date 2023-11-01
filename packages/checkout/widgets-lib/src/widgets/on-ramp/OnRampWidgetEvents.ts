import {
  IMTBLWidgetEvents, OnRampEventType, WidgetEvent,
  WidgetType,
} from '@imtbl/checkout-sdk';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function sendOnRampWidgetCloseEvent(eventTarget: Window | EventTarget) {
  const closeWidgetEvent = new CustomEvent<WidgetEvent<WidgetType.ONRAMP, OnRampEventType.CLOSE_WIDGET>>(
    IMTBLWidgetEvents.IMTBL_ONRAMP_WIDGET_EVENT,
    {
      detail: {
        type: OnRampEventType.CLOSE_WIDGET,
        data: {},
      },
    },
  );
  // TODO: please remove or if necessary keep the eslint ignore
  // eslint-disable-next-line no-console
  console.log('close widget event:', closeWidgetEvent);
  if (eventTarget !== undefined) eventTarget.dispatchEvent(closeWidgetEvent);
}

export const sendOnRampSuccessEvent = (eventTarget: Window | EventTarget, transactionHash: string) => {
  const successEvent = new CustomEvent<WidgetEvent<WidgetType.ONRAMP, OnRampEventType.SUCCESS>>(
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
  if (eventTarget !== undefined) eventTarget.dispatchEvent(successEvent);
};

export const sendOnRampFailedEvent = (eventTarget: Window | EventTarget, reason: string) => {
  const failedEvent = new CustomEvent<WidgetEvent<WidgetType.ONRAMP, OnRampEventType.FAILURE>>(
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
  if (eventTarget !== undefined) eventTarget.dispatchEvent(failedEvent);
};
