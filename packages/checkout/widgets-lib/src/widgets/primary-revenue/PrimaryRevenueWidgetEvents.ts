import {
  WidgetEvent,
  IMTBLWidgetEvents,
  PrimaryRevenueEventType,
  PrimaryRevenueSuccess,
  PrimaryRevenueFailed,
} from '@imtbl/checkout-widgets';

export const sendPrimaryRevenueWidgetCloseEvent = (
  eventTarget: Window | EventTarget,
) => {
  const event = new CustomEvent<WidgetEvent<any>>(
    IMTBLWidgetEvents.IMTBL_PRIMARY_REVENUE_WIDGET_EVENT,
    {
      detail: {
        type: PrimaryRevenueEventType.CLOSE_WIDGET,
        data: {},
      },
    },
  );

  // eslint-disable-next-line no-console
  console.log('close widget event:', event);
  if (eventTarget !== undefined) eventTarget.dispatchEvent(event);
};

export const sendPrimaryRevenueSuccessEvent = (
  eventTarget: Window | EventTarget,
  data: Record<string, string>,
) => {
  const event = new CustomEvent<WidgetEvent<PrimaryRevenueSuccess>>(
    IMTBLWidgetEvents.IMTBL_PRIMARY_REVENUE_WIDGET_EVENT,
    {
      detail: {
        type: PrimaryRevenueEventType.SUCCESS,
        data,
      },
    },
  );
  // eslint-disable-next-line no-console
  console.log('primary revenue success event:', event);
  if (eventTarget !== undefined) eventTarget.dispatchEvent(event);
};

export const sendPrimaryRevenueFailedEvent = (
  eventTarget: Window | EventTarget,
  reason: string,
) => {
  const event = new CustomEvent<WidgetEvent<PrimaryRevenueFailed>>(
    IMTBLWidgetEvents.IMTBL_PRIMARY_REVENUE_WIDGET_EVENT,
    {
      detail: {
        type: PrimaryRevenueEventType.FAILURE,
        data: {
          reason,
          timestamp: new Date().getTime(),
        },
      },
    },
  );
  // eslint-disable-next-line no-console
  console.log('primary revenue failed event:', event);
  if (eventTarget !== undefined) eventTarget.dispatchEvent(event);
};
