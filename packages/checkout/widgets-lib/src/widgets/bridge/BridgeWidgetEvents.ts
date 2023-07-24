import {
  WidgetEvent,
  BridgeEventType,
  BridgeSuccess,
  IMTBLWidgetEvents,
  BridgeFailed,
} from '@imtbl/checkout-widgets';

export const sendBridgeSuccessEvent = (transactionHash: string) => {
  const successEvent = new CustomEvent<WidgetEvent<BridgeSuccess>>(
    IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT,
    {
      detail: {
        type: BridgeEventType.SUCCESS,
        data: {
          transactionHash,
        },
      },
    },
  );
  if (window !== undefined) window.dispatchEvent(successEvent);
};

export const sendBridgeFailedEvent = (reason: string) => {
  const failedEvent = new CustomEvent<WidgetEvent<BridgeFailed>>(
    IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT,
    {
      detail: {
        type: BridgeEventType.FAILURE,
        data: {
          reason,
          timestamp: new Date().getTime(),
        },
      },
    },
  );
  if (window !== undefined) window.dispatchEvent(failedEvent);
};

export function sendBridgeWidgetCloseEvent() {
  // eslint-disable-next-line no-console
  console.log(BridgeEventType.CLOSE_WIDGET);
  const closeWidgetEvent = new CustomEvent<WidgetEvent<any>>(
    IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT,
    {
      detail: {
        type: BridgeEventType.CLOSE_WIDGET,
        data: {},
      },
    },
  );
  if (window !== undefined) window.dispatchEvent(closeWidgetEvent);
}
