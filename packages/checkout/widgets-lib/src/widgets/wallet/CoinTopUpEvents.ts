import {
  BridgeEvent,
  BridgeEventType,
  IMTBLWidgetEvents,
  OnRampCoinsEvent,
  OnRampEvent,
  OnRampEventType,
  SwapEvent,
  SwapEventType,
  WalletEventType,
  BridgeCoinsEvent,
  SwapCoinsEvent,
  WalletAddCoinsEvent,
  WalletEvent,
} from '@imtbl/checkout-widgets';

export function sendAddCoinsEvent(eventData: WalletAddCoinsEvent) {
  const addCoinsEvent = new CustomEvent<WalletEvent<WalletAddCoinsEvent>>(
    IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT,
    {
      detail: {
        type: WalletEventType.ADD_COINS,
        data: eventData,
      },
    }
  );
  console.log('add coins event:', addCoinsEvent);
  if (window !== undefined) window.dispatchEvent(addCoinsEvent);
}

export function sendOnRampCoinsEvent(eventData: OnRampCoinsEvent) {
  const addCoinsEvent = new CustomEvent<OnRampEvent<OnRampCoinsEvent>>(
    IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT,
    {
      detail: {
        type: OnRampEventType.ONRAMP_COINS,
        data: eventData,
      },
    }
  );
  console.log('on-ramp coins event:', addCoinsEvent);
  if (window !== undefined) window.dispatchEvent(addCoinsEvent);
}

export function sendSwapCoinsEvent(eventData: SwapCoinsEvent) {
  const swapCoinsEvent = new CustomEvent<SwapEvent<SwapCoinsEvent>>(
    IMTBLWidgetEvents.IMTBL_SWAP_WIDGET_EVENT,
    {
      detail: {
        type: SwapEventType.SWAP_COINS,
        data: eventData,
      },
    }
  );
  console.log('swap coins event:', swapCoinsEvent);
  if (window !== undefined) window.dispatchEvent(swapCoinsEvent);
}

export function sendBridgeCoinsEvent(eventData: BridgeCoinsEvent) {
  const bridgeCoinsEvent = new CustomEvent<BridgeEvent<BridgeCoinsEvent>>(
    IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT,
    {
      detail: {
        type: BridgeEventType.BRIDGE_COINS,
        data: eventData,
      },
    }
  );
  console.log('bridge coins event:', bridgeCoinsEvent);
  if (window !== undefined) window.dispatchEvent(bridgeCoinsEvent);
}
