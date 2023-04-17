import { useEffect } from 'react';

import {
  ConnectEventType,
  ConnectionSuccess,
  ConnectionFailed,
  IMTBLWidgetEvents,
  WidgetTheme,
  ConnectionProviders,
} from '@imtbl/checkout-ui-types';

function ConnectUI() {
  useEffect(() => {
    // Add event listeners for the IMXConnectWidget and handle event types appropriately
    const handleConnectEvent = ((event: CustomEvent) => {
      console.log(event);
      console.log('Getting data from within the event');
      switch (event.detail.type) {
        case ConnectEventType.SUCCESS: {
          const eventData = event.detail.data as ConnectionSuccess;
          console.log(eventData.providerPreference);
          console.log(eventData.timestamp);
          break;
        }
        case ConnectEventType.FAILURE: {
          const eventData = event.detail.data as ConnectionFailed;
          console.log(eventData.reason);
          console.log(eventData.timestamp);
          break;
        }
        default:
          console.log('did not match any expected event type');
      }
    }) as EventListener;

    window.addEventListener(
      IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT,
      handleConnectEvent
    );
    return () => {
      window.removeEventListener(
        IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT,
        handleConnectEvent
      );
    };
  }, []);

  return (
    <div className="Connect">
      <h1 className="sample-heading">Checkout Connect (Web Component)</h1>
      <imtbl-connect
        providerPreference={ConnectionProviders.METAMASK}
        theme={WidgetTheme.DARK}
      ></imtbl-connect>
    </div>
  );
}

export default ConnectUI;
