import {
  WidgetEvent,
  CommerceEventType,
  IMTBLWidgetEvents,
  WidgetType,
  WidgetEventData,
} from '@imtbl/checkout-sdk';

export type CommerceEventDetail = {
  type: CommerceEventType;
  data: WidgetEventData[WidgetType.IMMUTABLE_COMMERCE][keyof WidgetEventData[WidgetType.IMMUTABLE_COMMERCE]];
};

export const sendCheckoutEvent = (
  eventTarget: Window | EventTarget,
  detail: CommerceEventDetail,
) => {
  const event = new CustomEvent<
  WidgetEvent<WidgetType.IMMUTABLE_COMMERCE, CommerceEventType>
  >(IMTBLWidgetEvents.IMTBL_COMMERCE_WIDGET_EVENT, { detail });
  // eslint-disable-next-line no-console
  console.log('checkout app event ', eventTarget, event);
  if (eventTarget !== undefined) eventTarget.dispatchEvent(event);
};
