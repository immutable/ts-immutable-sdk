import { Web3Provider } from '@ethersproject/providers';
import {
  ConnectEventType,
  ConnectionFailed,
  ConnectionSuccess,
  IMTBLWidgetEvents,
  OrchestrationEventType,
} from '@imtbl/checkout-widgets';
import { useContext, useEffect, useState } from 'react';
import { handleOrchestrationEvent } from './orchestration';
import { WidgetContext, hideAllWidgets } from './WidgetProvider';

export function useConnectWidget(setWeb3Provider: (val: Web3Provider) => void) {
  const {showWidgets, setShowWidgets} = useContext(WidgetContext);
  const {showConnect, showWallet, showBridge, showSwap} = showWidgets;

  useEffect(() => {
    const handleConnectEvent = ((event: CustomEvent) => {
      switch (event.detail.type) {
        case ConnectEventType.SUCCESS: {
          const eventData = event.detail.data as ConnectionSuccess;
          setWeb3Provider(eventData.provider);
          break;
        }
        case ConnectEventType.FAILURE: {
          // const eventData = event.detail.data as ConnectionFailed;
          break;
        }
        case ConnectEventType.CLOSE_WIDGET: {
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
          break;
      }
    }) as EventListener;
    
    if (showConnect || showWallet || showBridge || showSwap) {
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
  }, [showConnect, showWallet, showBridge, showSwap, setWeb3Provider]);
}
