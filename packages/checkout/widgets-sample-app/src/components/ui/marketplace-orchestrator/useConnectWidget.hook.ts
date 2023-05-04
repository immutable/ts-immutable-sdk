import {
  ConnectEventType,
  ConnectionFailed,
  ConnectionSuccess,
  IMTBLWidgetEvents,
} from '@imtbl/checkout-ui-types';
import { useContext, useEffect, useState } from 'react';
import { WidgetAction, WidgetActions, WidgetContext } from './WidgetContext';

export function useConnectWidget(
  showConnectWidget: boolean,
  widgetDispatch: React.Dispatch<WidgetAction>
) {
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
          widgetDispatch({
            payload: {
              type: WidgetActions.CLOSE_WIDGET,
            },
          });
          break;
        }
        case ConnectEventType.FAILURE: {
          const eventData = event.detail.data as ConnectionFailed;
          console.log(eventData.reason);
          widgetDispatch({
            payload: {
              type: WidgetActions.CLOSE_WIDGET,
            },
          });
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
    providerPreference,
    setProviderPreference,
  };
}
