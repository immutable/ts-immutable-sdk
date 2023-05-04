import {
  IMTBLWidgetEvents,
  OrchestrationEventType,
  RequestBridgeEvent,
  RequestSwapEvent,
  WalletEventType,
  WalletNetworkSwitchEvent,
} from '@imtbl/checkout-ui-types';
import { useContext, useEffect, useState } from 'react';
import { WidgetAction, WidgetActions } from './WidgetContext';

export function useWalletWidget(
  showWalletWidget: boolean,
  widgetDispatch: React.Dispatch<WidgetAction>
) {
  useEffect(() => {
    const handleWalletWidgetEvents = ((event: CustomEvent) => {
      console.log(event);
      switch (event.detail.type) {
        case WalletEventType.CLOSE_WIDGET: {
          const eventData = event.detail.data as any;
          console.log(eventData);
          widgetDispatch({
            payload: {
              type: WidgetActions.CLOSE_WIDGET,
            },
          });
          break;
        }
        case WalletEventType.NETWORK_SWITCH: {
          const eventData = event.detail.data as WalletNetworkSwitchEvent;
          console.log(eventData.network);
          break;
        }
        case OrchestrationEventType.REQUEST_SWAP: {
          const eventData = event.detail.data as RequestSwapEvent;
          widgetDispatch({
            payload: {
              type: WidgetActions.SHOW_SWAP_WIDGET,
              swapWidgetInputs: {},
            },
          });
          break;
        }
        case OrchestrationEventType.REQUEST_BRIDGE: {
          const eventData = event.detail.data as RequestBridgeEvent;
          widgetDispatch({
            payload: {
              type: WidgetActions.SHOW_BRIDGE_WIDGET,
              bridgeWidgetInputs: {},
            },
          });
          break;
        }
        default:
          console.log('did not match any expected event type');
      }
    }) as EventListener;
    if (showWalletWidget) {
      window.addEventListener(
        IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT,
        handleWalletWidgetEvents
      );
    }

    return () => {
      window.removeEventListener(
        IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT,
        handleWalletWidgetEvents
      );
    };
  }, [showWalletWidget]);
}
