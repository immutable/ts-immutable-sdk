import {
  IMTBLWidgetEvents,
  OrchestrationEventType,
  SwapEventType,
  SwapFailed,
  SwapRejected,
  SwapSuccess,
} from '@imtbl/checkout-widgets';
import { useContext, useEffect, useState } from 'react';
import { WidgetContext, hideAllWidgets } from './WidgetProvider';
import { handleOrchestrationEvent } from './orchestration';

export function useSwapWidget(setDoneSwap: (val: boolean) => void) {
  const {showWidgets, setShowWidgets} = useContext(WidgetContext);
  const {showSwap} = showWidgets;
  console.log('swap widget hook')

  useEffect(() => {
    console.log('swap widget hook use effect')
    const handleSwapWidgetEvents = ((event: CustomEvent) => {
      switch (event.detail.type) {
        case SwapEventType.SUCCESS: {
          const eventData = event.detail.data as SwapSuccess;
          setDoneSwap(true);
          break;
        }
        case SwapEventType.FAILURE: {
          const eventData = event.detail.data as SwapFailed;
          break;
        }
        case SwapEventType.REJECTED: {
          const eventData = event.detail.data as SwapRejected;
          break;
        }
        case SwapEventType.CLOSE_WIDGET: {
          console.log("########## SHOULD")
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

    if (showSwap) {
      window.addEventListener(
        IMTBLWidgetEvents.IMTBL_SWAP_WIDGET_EVENT,
        handleSwapWidgetEvents
      );
    }

    return () => {
      console.log('returning swap widget hook use effect')
      window.removeEventListener(
        IMTBLWidgetEvents.IMTBL_SWAP_WIDGET_EVENT,
        handleSwapWidgetEvents
      );
    };
  }, [showSwap]);

}
