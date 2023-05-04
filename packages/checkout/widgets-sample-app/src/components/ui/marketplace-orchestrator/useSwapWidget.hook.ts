import {
  IMTBLWidgetEvents,
  SwapEventType,
  WalletNetworkSwitchEvent,
} from '@imtbl/checkout-ui-types';
import { useEffect, useState } from 'react';
import { WidgetAction, WidgetActions } from './WidgetContext';

export function useSwapWidget(
  showSwapWidget: boolean,
  widgetDispatch: React.Dispatch<WidgetAction>
) {
  useEffect(() => {
    const handleSwapWidgetEvents = ((event: CustomEvent) => {
      console.log(event);
      switch (event.detail.type) {
        case SwapEventType.SUCCESS: {
          const eventData = event.detail.data as any;
          console.log(eventData);
          widgetDispatch({
            payload: {
              type: WidgetActions.CLOSE_WIDGET,
            },
          });
          break;
        }
        case SwapEventType.FAILURE: {
          const eventData = event.detail.data as WalletNetworkSwitchEvent;
          console.log(eventData.network);
          break;
        }
        default:
          console.log('did not match any expected event type');
      }
    }) as EventListener;
    if (showSwapWidget) {
      window.addEventListener(
        IMTBLWidgetEvents.IMTBL_SWAP_WIDGET_EVENT,
        handleSwapWidgetEvents
      );
    }

    return () => {
      window.removeEventListener(
        IMTBLWidgetEvents.IMTBL_SWAP_WIDGET_EVENT,
        handleSwapWidgetEvents
      );
    };
  }, [showSwapWidget]);
}
