import {
  SwapEvent,
  SwapEventType,
  SwapSuccess,
  IMTBLWidgetEvents,
  SwapFailed,
  SwapRejected,
} from '@imtbl/checkout-widgets';

export function sendSwapWidgetCloseEvent() {
  const closeWidgetEvent = new CustomEvent<SwapEvent<any>>(
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
  console.log('close widget event:', closeWidgetEvent);
  if (window !== undefined) window.dispatchEvent(closeWidgetEvent);
}

export const sendSwapSuccessEvent = () => {
  const successEvent = new CustomEvent<SwapEvent<SwapSuccess>>(
    IMTBLWidgetEvents.IMTBL_SWAP_WIDGET_EVENT,
    {
      detail: {
        type: SwapEventType.SUCCESS,
        data: {
          timestamp: new Date().getTime(),
        },
      },
    },
  );
  if (window !== undefined) window.dispatchEvent(successEvent);
};

export const sendSwapFailedEvent = (reason?: string) => {
  const failedEvent = new CustomEvent<SwapEvent<SwapFailed>>(
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
  if (window !== undefined) window.dispatchEvent(failedEvent);
};

export const sendSwapRejectedEvent = (reason?: string) => {
  const rejectedEvent = new CustomEvent<SwapEvent<SwapRejected>>(
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
  if (window !== undefined) window.dispatchEvent(rejectedEvent);
};
