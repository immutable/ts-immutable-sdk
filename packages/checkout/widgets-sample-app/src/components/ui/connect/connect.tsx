import { useEffect } from 'react';

import {
  ConnectEventType,
  ConnectionSuccess,
  ConnectionFailed,
  IMTBLWidgetEvents,
  WidgetTheme,
  ConnectReact,
  CheckoutWidgets,
  UpdateConfig,
  CheckoutWidgetsConfig,
} from '@imtbl/checkout-widgets';
import { Environment } from '@imtbl/config';

import { WalletProviderName } from '@imtbl/checkout-sdk';

function ConnectUI() {
  CheckoutWidgets({ theme: WidgetTheme.DARK, environment: Environment.PRODUCTION });
  useEffect(() => {
    // Add event listeners for the IMXConnectWidget and handle event types appropriately
    const handleConnectEvent = ((event: CustomEvent) => {
      console.log(event);
      console.log('Getting data from within the event');
      switch (event.detail.type) {
        case ConnectEventType.SUCCESS: {
          const eventData = event.detail.data as ConnectionSuccess;
          console.log(eventData.provider);
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


    window.addEventListener(IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT, handleConnectEvent);
    return () => {
      window.removeEventListener(IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT, handleConnectEvent);
    };
  }, []);

  return (
    <div className="Connect">
      <h1 className="sample-heading">Checkout Connect (Web Component)</h1>
      <ConnectReact />
    </div>
  );
}

export default ConnectUI;
