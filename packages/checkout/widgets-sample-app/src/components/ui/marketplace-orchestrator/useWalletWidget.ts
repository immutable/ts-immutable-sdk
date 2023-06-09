import {
  IMTBLWidgetEvents,
  OrchestrationEventType,
  WalletEventType,
  WalletNetworkSwitchEvent,
} from '@imtbl/checkout-widgets';
import { useContext, useEffect, useState } from 'react';
import { WidgetContext, hideAllWidgets } from './WidgetProvider';
import { handleOrchestrationEvent } from './orchestration';

export function useWalletWidget(setProviderPreference: (val: string) => void) {
  const {showWidgets, setShowWidgets} = useContext(WidgetContext);
  const {showWallet} = showWidgets;

  useEffect(() => {
    const handleWalletWidgetEvents = ((event: CustomEvent) => {
      switch (event.detail.type) {
        case WalletEventType.NETWORK_SWITCH: {
          const eventData = event.detail.data as WalletNetworkSwitchEvent;
          console.log(eventData.network);
          break;
        }
        case WalletEventType.DISCONNECT_WALLET: {
          setProviderPreference("");
          setShowWidgets(hideAllWidgets);
          break;
        }
        case WalletEventType.CLOSE_WIDGET: {
          setShowWidgets(hideAllWidgets);
          break;
        }
        case OrchestrationEventType.REQUEST_CONNECT:
        case OrchestrationEventType.REQUEST_WALLET:
        case OrchestrationEventType.REQUEST_SWAP:
        case OrchestrationEventType.REQUEST_BRIDGE: {
          handleOrchestrationEvent(event, setShowWidgets);
          break;
        }
        default:
          console.log('did not match any expected event type');
      }
    }) as EventListener;

    if (showWallet) {
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
  }, [showWallet]);
}
