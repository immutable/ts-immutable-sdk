import {
  ConnectEventType,
  ConnectionFailed,
  ConnectionSuccess,
  IMTBLWidgetEvents,
} from '@imtbl/checkout-widgets-react';
import { useEffect, useState } from 'react';

export function useConnectWidget() {
  const [showConnectWidget, setShowConnectWidget] = useState(false);
  const [providerPreference, setProviderPreference] = useState('');

  useEffect(() => {
    // Add event listeners for the IMXConnectWidget and handle event types appropriately
    const handleConnectEvent = ((event: CustomEvent) => {
      console.log(event);
      switch (event.detail.type) {
        case ConnectEventType.SUCCESS: {
          const eventData = event.detail.data as ConnectionSuccess;
          console.log(eventData.providerPreference);
          setProviderPreference(eventData.providerPreference);
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
    providerPreference,
    setShowConnectWidget,
    setProviderPreference,
  };
}
