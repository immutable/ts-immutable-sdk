import {
  IMTBLWidgetEvents,
  OnRampEventType,
  OrchestrationEventType,
} from '@imtbl/checkout-sdk';
import { useContext, useEffect } from 'react';
import { WidgetContext, hideAllWidgets } from './WidgetProvider';
import { handleOrchestrationEvent } from './orchestration';

export function useOnRampWidget() {
  const {showWidgets, setShowWidgets} = useContext(WidgetContext);
  const {showOnRamp} = showWidgets;

  useEffect(() => {
    const handleOnRampWidgetEvents = ((event: CustomEvent) => {
      switch (event.detail.type) {
        case OnRampEventType.CLOSE_WIDGET: {
          setShowWidgets(hideAllWidgets);
          break;
        }
        case OrchestrationEventType.REQUEST_CONNECT:
        case OrchestrationEventType.REQUEST_WALLET:
        case OrchestrationEventType.REQUEST_SWAP:
        case OrchestrationEventType.REQUEST_BRIDGE:
        case OrchestrationEventType.REQUEST_ONRAMP: {
          handleOrchestrationEvent(event, setShowWidgets);
          break;
        }
        default:
          console.log('did not match any expected event type');
      }
    }) as EventListener;

    if (showOnRamp) {
      window.addEventListener(
        IMTBLWidgetEvents.IMTBL_ONRAMP_WIDGET_EVENT,
        handleOnRampWidgetEvents
      );
    }

    return () => {
      window.removeEventListener(
        IMTBLWidgetEvents.IMTBL_ONRAMP_WIDGET_EVENT,
        handleOnRampWidgetEvents
      );
    };
  }, [showOnRamp]);

}
