import {
  SwapEvent,
  SwapEventType,
  SwapSuccess,
  IMTBLWidgetEvents,
  SwapFailed,
} from '@imtbl/checkout-ui-types';

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
    }
  );
  if (window !== undefined) window.dispatchEvent(successEvent);
};

export const sendSwapFailedEvent = (reason: string) => {
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
    }
  );
  if (window !== undefined) window.dispatchEvent(failedEvent);
};
