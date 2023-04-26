import {
  BridgeEvent,
  BridgeEventType,
  BridgeSuccess,
  IMTBLWidgetEvents,
  BridgeFailed,
} from '@imtbl/checkout-ui-types';

export const sendBridgeSuccessEvent = () => {
  const successEvent = new CustomEvent<BridgeEvent<BridgeSuccess>>(
    IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT,
    {
      detail: {
        type: BridgeEventType.SUCCESS,
        data: {
          timestamp: new Date().getTime(),
        },
      },
    }
  );
  if (window !== undefined) window.dispatchEvent(successEvent);
};

export const sendBridgeFailedEvent = (reason: string) => {
  const failedEvent = new CustomEvent<BridgeEvent<BridgeFailed>>(
    IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT,
    {
      detail: {
        type: BridgeEventType.FAILURE,
        data: {
          reason,
          timestamp: new Date().getTime(),
        },
      },
    }
  );
  if (window !== undefined) window.dispatchEvent(failedEvent);
};

export function sendBridgeWidgetCloseEvent() {
  console.log(BridgeEventType.CLOSE_WIDGET);
  const closeWidgetEvent = new CustomEvent<BridgeEvent<any>>(
    IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT,
    {
      detail: {
        type: BridgeEventType.CLOSE_WIDGET,
        data: {},
      },
    }
  );
  if (window !== undefined) window.dispatchEvent(closeWidgetEvent);
}
