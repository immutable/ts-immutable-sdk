import {
  IMTBLWidgetEvents,
  OrchestrationEvent,
  OrchestrationEventType,
  RequestBridgeEvent,
  RequestOnrampEvent,
  RequestSwapEvent,
} from '@imtbl/checkout-sdk';

function sendRequestOnrampEvent(
  eventTarget: Window | EventTarget,
  imtblWidgetEvent: IMTBLWidgetEvents,
  eventData: RequestOnrampEvent,
) {
  const requestOnrampEvent = new CustomEvent<OrchestrationEvent<OrchestrationEventType.REQUEST_ONRAMP>>(
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
  const requestSwapEvent = new CustomEvent<OrchestrationEvent<OrchestrationEventType.REQUEST_SWAP>>(
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
  // eslint-disable-next-line max-len
  const requestBridgeEvent = new CustomEvent<OrchestrationEvent<OrchestrationEventType.REQUEST_BRIDGE>>(imtblWidgetEvent, {
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
