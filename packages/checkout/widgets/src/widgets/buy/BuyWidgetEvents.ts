import {
  BuyEvent,
  BuyEventType,
  BuySuccess,
  IMTBLWidgetEvents,
  BuyFailed,
  BuyClose,
  BuyNotConnected,
} from '@imtbl/checkout-ui-types';

export const sendBuySuccessEvent = () => {
  const successEvent = new CustomEvent<BuyEvent<BuySuccess>>(
    IMTBLWidgetEvents.IMTBL_BUY_WIDGET_EVENT,
    {
      detail: {
        type: BuyEventType.SUCCESS,
        data: {
          timestamp: new Date().getTime(),
        },
      },
    }
  );
  if (window !== undefined) window.dispatchEvent(successEvent);
};

export const sendBuyFailedEvent = (reason: string) => {
  const failedEvent = new CustomEvent<BuyEvent<BuyFailed>>(
    IMTBLWidgetEvents.IMTBL_BUY_WIDGET_EVENT,
    {
      detail: {
        type: BuyEventType.FAILURE,
        data: {
          reason,
          timestamp: new Date().getTime(),
        },
      },
    }
  );
  if (window !== undefined) window.dispatchEvent(failedEvent);
};

export const sendBuyWidgetCloseEvent = () => {
  const closeEvent = new CustomEvent<BuyEvent<BuyClose>>(
    IMTBLWidgetEvents.IMTBL_BUY_WIDGET_EVENT,
    {
      detail: {
        type: BuyEventType.CLOSE,
        data: {},
      },
    }
  );
  if (window !== undefined) window.dispatchEvent(closeEvent);
};

export const sendBuyWidgetNotConnectedEvent = (providerPreference: string) => {
  const notConnectedEvent = new CustomEvent<BuyEvent<BuyNotConnected>>(
    IMTBLWidgetEvents.IMTBL_BUY_WIDGET_EVENT,
    {
      detail: {
        type: BuyEventType.NOT_CONNECTED,
        data: { providerPreference },
      },
    }
  );
  if (window !== undefined) window.dispatchEvent(notConnectedEvent);
};
