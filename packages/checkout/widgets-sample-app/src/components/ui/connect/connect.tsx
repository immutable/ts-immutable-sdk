import { useEffect } from 'react';

import {
  ConnectEventType,
  ConnectionSuccess,
  ConnectionFailed,
  IMTBLWidgetEvents,
  WidgetTheme,
  WidgetConnectionProviders,
  ConnectReact,
  CheckoutWidgets,
  UpdateConfig,
  CheckoutWidgetsConfig,
} from '@imtbl/checkout-widgets';
import { Environment } from '@imtbl/config';

function ConnectUI() {
  CheckoutWidgets({
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  });
  const widgetsConfig2: CheckoutWidgetsConfig = {
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  };

  UpdateConfig(widgetsConfig2);
  useEffect(() => {
    // Add event listeners for the IMXConnectWidget and handle event types appropriately
    const handleConnectEvent = ((event: CustomEvent) => {
      console.log(event);
      console.log('Getting data from within the event');
      switch (event.detail.type) {
        case ConnectEventType.SUCCESS: {
          const eventData = event.detail.data as ConnectionSuccess;
          console.log(eventData.providerPreference);
          break;
        }
        case ConnectEventType.FAILURE: {
          const eventData = event.detail.data as ConnectionFailed;
          console.log(eventData.reason);
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
      <ConnectReact providerPreference={WidgetConnectionProviders.METAMASK} />
    </div>
  );
}

export default ConnectUI;
