import { CheckoutFlowType, OrchestrationEventType } from '@imtbl/checkout-sdk';

/**
 * Get view from orchestration event type
 */
export function getViewFromOrchestrationEventType(
  type: OrchestrationEventType,
): CheckoutFlowType | null {
  switch (type) {
    case OrchestrationEventType.REQUEST_SWAP:
      return CheckoutFlowType.SWAP;
    case OrchestrationEventType.REQUEST_CONNECT:
      return CheckoutFlowType.CONNECT;
    case OrchestrationEventType.REQUEST_WALLET:
      return CheckoutFlowType.WALLET;
    case OrchestrationEventType.REQUEST_BRIDGE:
      return CheckoutFlowType.BRIDGE;
    case OrchestrationEventType.REQUEST_ONRAMP:
      return CheckoutFlowType.ONRAMP;
    case OrchestrationEventType.REQUEST_ADD_FUNDS:
      return CheckoutFlowType.ADD_FUNDS;
    default:
      return null;
  }
}
