import {
  IMTBLWidgetEvents,
  WalletEventType,
  WalletAddCoinsEvent,
  WalletEvent,
  WalletRequestOnrampEvent,
  WalletRequestSwapEvent,
  WalletRequestBridgeEvent,
} from '@imtbl/checkout-widgets';

export function sendAddCoinsEvent(eventData: WalletAddCoinsEvent) {
  const addCoinsEvent = new CustomEvent<WalletEvent<WalletAddCoinsEvent>>(
    IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT,
    {
      detail: {
        type: WalletEventType.ADD_COINS,
        data: eventData,
      },
    },
  );
  // TODO: please remove or if necessary keep the eslint ignore
  // eslint-disable-next-line no-console
  console.log('add coins event:', addCoinsEvent);
  if (window !== undefined) window.dispatchEvent(addCoinsEvent);
}

export function sendOnRampCoinsEvent(eventData: WalletRequestOnrampEvent) {
  const addCoinsEvent = new CustomEvent<WalletEvent<WalletRequestOnrampEvent>>(
    IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT,
    {
      detail: {
        type: WalletEventType.REQUEST_ONRAMP,
        data: eventData,
      },
    },
  );
  // TODO: please remove or if necessary keep the eslint ignore
  // eslint-disable-next-line no-console
  console.log('on-ramp coins event:', addCoinsEvent);
  if (window !== undefined) window.dispatchEvent(addCoinsEvent);
}

export function sendSwapCoinsEvent(eventData: WalletRequestSwapEvent) {
  const swapCoinsEvent = new CustomEvent<WalletEvent<WalletRequestSwapEvent>>(
    IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT,
    {
      detail: {
        type: WalletEventType.REQUEST_SWAP,
        data: eventData,
      },
    },
  );
  // TODO: please remove or if necessary keep the eslint ignore
  // eslint-disable-next-line no-console
  console.log('swap coins event:', swapCoinsEvent);
  if (window !== undefined) window.dispatchEvent(swapCoinsEvent);
}

export function sendBridgeCoinsEvent(eventData: WalletRequestBridgeEvent) {
  const bridgeCoinsEvent = new CustomEvent<
  WalletEvent<WalletRequestBridgeEvent>
  >(IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT, {
    detail: {
      type: WalletEventType.REQUEST_BRIDGE,
      data: eventData,
    },
  });
  // TODO: please remove or if necessary keep the eslint ignore
  // eslint-disable-next-line no-console
  console.log('bridge coins event:', bridgeCoinsEvent);
  if (window !== undefined) window.dispatchEvent(bridgeCoinsEvent);
}
