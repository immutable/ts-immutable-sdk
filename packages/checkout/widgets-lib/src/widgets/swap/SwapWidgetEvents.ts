import {
  WidgetEvent,
  SwapEventType,
  IMTBLWidgetEvents,
  WidgetType,
} from '@imtbl/checkout-sdk';

export function sendSwapWidgetCloseEvent(eventTarget: Window | EventTarget) {
  const closeWidgetEvent = new CustomEvent<WidgetEvent<WidgetType.SWAP, SwapEventType.CLOSE_WIDGET>>(
    IMTBLWidgetEvents.IMTBL_SWAP_WIDGET_EVENT,
    {
      detail: {
        type: SwapEventType.CLOSE_WIDGET,
        data: {},
      },
    },
  );
  // TODO: remove once fixed
  // eslint-disable-next-line no-console
  console.log('close widget event:', eventTarget, closeWidgetEvent);
  if (eventTarget !== undefined) eventTarget.dispatchEvent(closeWidgetEvent);
}

export const sendSwapSuccessEvent = (eventTarget: Window | EventTarget, transactionHash: string) => {
  const successEvent = new CustomEvent<WidgetEvent<WidgetType.SWAP, SwapEventType.SUCCESS>>(
    IMTBLWidgetEvents.IMTBL_SWAP_WIDGET_EVENT,
    {
      detail: {
        type: SwapEventType.SUCCESS,
        data: {
          transactionHash,
        },
      },
    },
  );
  // eslint-disable-next-line no-console
  console.log('swap success event:', eventTarget, successEvent);
  if (eventTarget !== undefined) eventTarget.dispatchEvent(successEvent);
};

export const sendSwapFailedEvent = (eventTarget: Window | EventTarget, reason: string) => {
  const failedEvent = new CustomEvent<WidgetEvent<WidgetType.SWAP, SwapEventType.FAILURE>>(
    IMTBLWidgetEvents.IMTBL_SWAP_WIDGET_EVENT,
    {
      detail: {
        type: SwapEventType.FAILURE,
        data: {
          reason,
          timestamp: new Date().getTime(),
        },
      },
    },
  );
  // eslint-disable-next-line no-console
  console.log('swap failed event:', eventTarget, failedEvent);
  if (eventTarget !== undefined) eventTarget.dispatchEvent(failedEvent);
};

export const sendSwapRejectedEvent = (eventTarget: Window | EventTarget, reason: string) => {
  const rejectedEvent = new CustomEvent<WidgetEvent<WidgetType.SWAP, SwapEventType.REJECTED>>(
    IMTBLWidgetEvents.IMTBL_SWAP_WIDGET_EVENT,
    {
      detail: {
        type: SwapEventType.REJECTED,
        data: {
          reason,
          timestamp: new Date().getTime(),
        },
      },
    },
  );
  // eslint-disable-next-line no-console
  console.log('swap rejected event:', eventTarget, rejectedEvent);
  if (eventTarget !== undefined) eventTarget.dispatchEvent(rejectedEvent);
};
