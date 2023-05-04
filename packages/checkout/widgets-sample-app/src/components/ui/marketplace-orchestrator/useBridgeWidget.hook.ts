import {
  BridgeEventType,
  IMTBLWidgetEvents,
  WalletNetworkSwitchEvent,
} from '@imtbl/checkout-ui-types';
import { useEffect } from 'react';
import { WidgetAction, WidgetActions } from './WidgetContext';

export function useBridgeWidget(
  showBridgeWidget: boolean,
  widgetDispatch: React.Dispatch<WidgetAction>
) {
  useEffect(() => {
    const handleBridgeWidgetEvents = ((event: CustomEvent) => {
      console.log(event);
      switch (event.detail.type) {
        case BridgeEventType.CLOSE_WIDGET: {
          const eventData = event.detail.data as any;
          console.log(eventData);
          widgetDispatch({
            payload: {
              type: WidgetActions.CLOSE_WIDGET,
            },
          });
          break;
        }
        case BridgeEventType.SUCCESS: {
          const eventData = event.detail.data as WalletNetworkSwitchEvent;
          console.log(eventData.network);
          break;
        }
        default:
          console.log('did not match any expected event type');
      }
    }) as EventListener;
    if (showBridgeWidget) {
      window.addEventListener(
        IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT,
        handleBridgeWidgetEvents
      );
    }

    return () => {
      window.removeEventListener(
        IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT,
        handleBridgeWidgetEvents
      );
    };
  }, [showBridgeWidget]);
}
