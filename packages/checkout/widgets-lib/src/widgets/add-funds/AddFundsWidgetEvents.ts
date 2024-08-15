import {
  WidgetEvent,
  WidgetType,
  AddFundsEventType,
  IMTBLWidgetEvents,
} from '@imtbl/checkout-sdk';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function sendAddFundsCloseEvent(eventTarget: Window | EventTarget) {
  const closeWidgetEvent = new CustomEvent<
  WidgetEvent<WidgetType.ADD_FUNDS, AddFundsEventType.CLOSE_WIDGET>
  >(IMTBLWidgetEvents.IMTBL_ADD_FUNDS_WIDGET_EVENT, {
    detail: {
      type: AddFundsEventType.CLOSE_WIDGET,
      data: {},
    },
  });
  // TODO: please remove or if necessary keep the eslint ignore
  // eslint-disable-next-line no-console
  console.log('close widget event:', closeWidgetEvent);
  if (eventTarget !== undefined) eventTarget.dispatchEvent(closeWidgetEvent);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function sendAddFundsGoBackEvent(eventTarget: Window | EventTarget) {
  const closeWidgetEvent = new CustomEvent<
  WidgetEvent<WidgetType.ADD_FUNDS, AddFundsEventType.GO_BACK>
  >(IMTBLWidgetEvents.IMTBL_ADD_FUNDS_WIDGET_EVENT, {
    detail: {
      type: AddFundsEventType.GO_BACK,
      data: {},
    },
  });
  // TODO: please remove or if necessary keep the eslint ignore
  // eslint-disable-next-line no-console
  console.log('go back event:', closeWidgetEvent);
  if (eventTarget !== undefined) eventTarget.dispatchEvent(closeWidgetEvent);
}
