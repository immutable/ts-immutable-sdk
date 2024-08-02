import {
  WidgetEvent,
  CheckoutEventType,
  IMTBLWidgetEvents,
  WidgetType,
} from '@imtbl/checkout-sdk';

export const sendCheckoutEvent = (
  eventTarget: Window | EventTarget,
  eventDetail: {
    type: CheckoutEventType;
    data: Record<string, unknown>;
  },
) => {
  const event = new CustomEvent<
  WidgetEvent<WidgetType.CHECKOUT, CheckoutEventType>
  >(IMTBLWidgetEvents.IMTBL_CHECKOUT_WIDGET_EVENT, {
    detail: {
      type: eventDetail.type,
      data: eventDetail.data as any,
    },
  });
  // eslint-disable-next-line no-console
  console.log('checkout app event ', eventTarget, event);
  if (eventTarget !== undefined) eventTarget.dispatchEvent(event);
};
