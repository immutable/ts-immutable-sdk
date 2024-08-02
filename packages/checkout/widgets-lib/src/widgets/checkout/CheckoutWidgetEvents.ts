import {
  WidgetEvent,
  CheckoutEventType,
  IMTBLWidgetEvents,
  WidgetType,
  WidgetEventData,
} from '@imtbl/checkout-sdk';

export const sendCheckoutEvent = (
  eventTarget: Window | EventTarget,
  detail: {
    type: CheckoutEventType;
    data: WidgetEventData[WidgetType.CHECKOUT][keyof WidgetEventData[WidgetType.CHECKOUT]];
  },
) => {
  const event = new CustomEvent<
  WidgetEvent<WidgetType.CHECKOUT, CheckoutEventType>
  >(IMTBLWidgetEvents.IMTBL_CHECKOUT_WIDGET_EVENT, { detail });
  // eslint-disable-next-line no-console
  console.log('checkout app event ', eventTarget, event);
  if (eventTarget !== undefined) eventTarget.dispatchEvent(event);
};
