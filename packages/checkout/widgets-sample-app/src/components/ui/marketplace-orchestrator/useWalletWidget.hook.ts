import {
  IMTBLWidgetEvents,
  WalletEventType,
  WalletNetworkSwitchEvent,
} from '@imtbl/checkout-widgets';
import { useEffect, useState } from 'react';

export function useWalletWidget() {
  const [showWalletWidget, setShowWalletWidget] = useState(false);

  useEffect(() => {
    const handleWalletWidgetEvents = ((event: CustomEvent) => {
      console.log(event);
      switch (event.detail.type) {
        case WalletEventType.CLOSE_WIDGET: {
          const eventData = event.detail.data as any;
          console.log(eventData);
          setShowWalletWidget(false);
          break;
        }
        case WalletEventType.NETWORK_SWITCH: {
          const eventData = event.detail.data as WalletNetworkSwitchEvent;
          console.log(eventData.network);
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

  return {
    showWalletWidget,
    setShowWalletWidget,
  };
}
