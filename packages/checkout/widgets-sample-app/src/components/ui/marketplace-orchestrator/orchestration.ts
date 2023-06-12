import { OrchestrationEventType } from "@imtbl/checkout-widgets";
import { Dispatch, SetStateAction } from "react";
import { WidgetState, hideAllWidgets } from "./WidgetProvider";

export function handleOrchestrationEvent(
  event: CustomEvent,
  setShowWidgets: Dispatch<SetStateAction<WidgetState>>,
){
  switch(event.detail.type) {
    case OrchestrationEventType.REQUEST_CONNECT: {
      setShowWidgets({...hideAllWidgets, showConnect: true})
      return;
    }
    case OrchestrationEventType.REQUEST_WALLET: {
      setShowWidgets({...hideAllWidgets, showWallet: true})
      return;
    }
    case OrchestrationEventType.REQUEST_SWAP: {
      setShowWidgets({...hideAllWidgets, showSwap: true})
      return;
    }
    case OrchestrationEventType.REQUEST_BRIDGE: {
      setShowWidgets({...hideAllWidgets, showBridge: true})
      return;
    }
    default: {
      console.log('orchestration event not handled')
      return
    }
  }
}