import {
  WidgetEvent,
  SwapEventType,
  IMTBLWidgetEvents,
} from '@imtbl/checkout-widgets';

export function sendOnRampWidgetCloseEvent() {
  const closeWidgetEvent = new CustomEvent<WidgetEvent<any>>(
    IMTBLWidgetEvents.IMTBL_ONRAMP_WIDGET_EVENT,
    {
      detail: {
        type: SwapEventType.CLOSE_WIDGET,
        data: {},
      },
    },
  );
    // eslint-disable-next-line no-console
  console.log('close widget event:', closeWidgetEvent);
  if (window !== undefined) window.dispatchEvent(closeWidgetEvent);
}
