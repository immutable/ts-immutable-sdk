import { IMTBLWidgetEvents, WalletEventType, WidgetEvent } from '@imtbl/checkout-widgets';

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
