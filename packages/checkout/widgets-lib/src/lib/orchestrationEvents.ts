import {
  IMTBLWidgetEvents,
  OrchestrationEventType,
  RequestBridgeEvent,
  RequestOnrampEvent,
  RequestSwapEvent,
  WidgetEvent,
  WidgetType,
} from '@imtbl/checkout-sdk';

function sendRequestOnrampEvent(
  eventTarget: Window | EventTarget,
  imtblWidgetEvent: IMTBLWidgetEvents,
  eventData: RequestOnrampEvent,
) {
  const requestOnrampEvent = new CustomEvent<WidgetEvent<WidgetType.ONRAMP>>(
    imtblWidgetEvent,
    {
      detail: {
        type: OrchestrationEventType.REQUEST_ONRAMP,
        data: eventData,
      },
    },
  );
  // TODO: please remove or if necessary keep the eslint ignore
  // eslint-disable-next-line no-console
  console.log('request onramp event:', eventTarget, requestOnrampEvent);
  if (eventTarget !== undefined) eventTarget.dispatchEvent(requestOnrampEvent);
}

function sendRequestSwapEvent(
  eventTarget: Window | EventTarget,
  imtblWidgetEvent: IMTBLWidgetEvents,
  eventData: RequestSwapEvent,
) {
  const requestSwapEvent = new CustomEvent<WidgetEvent<WidgetType.SWAP>>(
    imtblWidgetEvent,
    {
      detail: {
        type: OrchestrationEventType.REQUEST_SWAP,
        data: eventData,
      },
    },
  );
  // TODO: please remove or if necessary keep the eslint ignore
  // eslint-disable-next-line no-console
  console.log('request swap event:', eventTarget, requestSwapEvent);
  if (eventTarget !== undefined) eventTarget.dispatchEvent(requestSwapEvent);
}

function sendRequestBridgeEvent(
  eventTarget: Window | EventTarget,
  imtblWidgetEvent: IMTBLWidgetEvents,
  eventData: RequestBridgeEvent,
) {
  const requestBridgeEvent = new CustomEvent<WidgetEvent<WidgetType.BRIDGE>>(imtblWidgetEvent, {
    detail: {
      type: OrchestrationEventType.REQUEST_BRIDGE,
      data: eventData,
    },
  });
  // TODO: please remove or if necessary keep the eslint ignore
  // eslint-disable-next-line no-console
  console.log('bridge coins event:', eventTarget, requestBridgeEvent);
  if (eventTarget !== undefined) eventTarget.dispatchEvent(requestBridgeEvent);
}

export const orchestrationEvents = {
  sendRequestBridgeEvent,
  sendRequestSwapEvent,
  sendRequestOnrampEvent,
};
