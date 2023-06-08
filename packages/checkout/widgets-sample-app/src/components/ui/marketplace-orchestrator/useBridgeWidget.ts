import {
  BridgeEventType,
  BridgeFailed,
  BridgeSuccess,
  IMTBLWidgetEvents,
  OrchestrationEventType,
} from '@imtbl/checkout-widgets';
import { useContext, useEffect, useState } from 'react';
import { WidgetContext, hideAllWidgets } from './WidgetProvider';
import { handleOrchestrationEvent } from './orchestration';

export function useBridgeWidget() {
  const {showWidgets, setShowWidgets} = useContext(WidgetContext);
  const {showBridge} = showWidgets;
  console.log('bridge widget hook')

  useEffect(() => {
    console.log('bridge widget hook use effect')
    const handleBridgeWidgetEvents = ((event: CustomEvent) => {
      switch (event.detail.type) {
        case BridgeEventType.SUCCESS: {
          const eventData = event.detail.data as BridgeSuccess;
          break;
        }
        case BridgeEventType.FAILURE: {
          const eventData = event.detail.data as BridgeFailed;
          break;
        }
        case BridgeEventType.CLOSE_WIDGET: {
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

    if (showBridge) {
      window.addEventListener(
        IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT,
        handleBridgeWidgetEvents
      );
    }

    return () => {
      console.log('returning bridge widget hook use effect')
      window.removeEventListener(
        IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT,
        handleBridgeWidgetEvents
      );
    };
  }, [showBridge]);

}
