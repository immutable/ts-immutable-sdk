import { useEffect, useMemo } from 'react';
import { IMTBLWidgetEvents } from '@imtbl/checkout-sdk';
import { getCheckoutWidgetEvent } from '../functions/getCheckoutWidgetEvent';
import { sendCheckoutEvent } from '../CheckoutWidgetEvents';

/** Widget Events List */
const widgetEvents = [
  IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT,
  IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT,
  IMTBLWidgetEvents.IMTBL_SWAP_WIDGET_EVENT,
  IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT,
  IMTBLWidgetEvents.IMTBL_ONRAMP_WIDGET_EVENT,
  IMTBLWidgetEvents.IMTBL_SALE_WIDGET_EVENT,
];

/**
 *
 */
export function useWidgetEvents(eventTarget: Window | EventTarget) {
  const handleWidgetEvent = useMemo(() => {
    if (!eventTarget) return null;

    return (event: Event) => {
      const eventDetail = getCheckoutWidgetEvent(event as CustomEvent);
      sendCheckoutEvent(eventTarget, eventDetail);
    };
  }, [eventTarget]);

  useEffect(() => {
    if (!handleWidgetEvent) return () => {};

    widgetEvents.map((event) => window.addEventListener(event, handleWidgetEvent));
    return () => {
      widgetEvents.map((event) => window.removeEventListener(event, handleWidgetEvent));
    };
  }, [handleWidgetEvent]);
}
