import { Web3Provider } from '@ethersproject/providers';
import { WalletProviderName } from '@imtbl/checkout-sdk';
import {
  ConnectEventType,
  ConnectionFailed,
  ConnectionSuccess,
  IMTBLWidgetEvents,
} from '@imtbl/checkout-widgets';
import { useEffect, useState } from 'react';

export function useConnectWidget() {
  const [showConnectWidget, setShowConnectWidget] = useState(false);
  const [provider, setProvider] = useState<Web3Provider>();
  const [providerName, setProviderName] = useState<WalletProviderName>();

  useEffect(() => {
    // Add event listeners for the IMXConnectWidget and handle event types appropriately
    const handleConnectEvent = ((event: CustomEvent) => {
      console.log(event);
      switch (event.detail.type) {
        case ConnectEventType.SUCCESS: {
          const eventData = event.detail.data as ConnectionSuccess;
          console.log(eventData.provider);
          setProvider(eventData.provider);
          setProviderName(eventData.providerName);
          setShowConnectWidget(false);
          break;
        }
        case ConnectEventType.FAILURE: {
          const eventData = event.detail.data as ConnectionFailed;
          console.log(eventData.reason);
          setShowConnectWidget(false);
          break;
        }
        default:
          console.log('did not match any expected event type');
      }
    }) as EventListener;
    if (showConnectWidget) {
      // subscribe to connect events
      window.addEventListener(
        IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT,
        handleConnectEvent
      );
    }

    return () => {
      window.removeEventListener(
        IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT,
        handleConnectEvent
      );
    };
  }, [showConnectWidget]);

  return {
    showConnectWidget,
    setShowConnectWidget,
    setProvider,
    provider,
    providerName,
    setProviderName
  };
}
