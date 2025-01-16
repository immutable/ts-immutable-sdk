import { CommerceFlowType, OrchestrationEventType } from '@imtbl/checkout-sdk';

/**
 * Get view from orchestration event type
 */
export function getViewFromOrchestrationEventType(
  type: OrchestrationEventType,
): CommerceFlowType | null {
  switch (type) {
    case OrchestrationEventType.REQUEST_SWAP:
      return CommerceFlowType.SWAP;
    case OrchestrationEventType.REQUEST_CONNECT:
      return CommerceFlowType.CONNECT;
    case OrchestrationEventType.REQUEST_WALLET:
      return CommerceFlowType.WALLET;
    case OrchestrationEventType.REQUEST_BRIDGE:
      return CommerceFlowType.BRIDGE;
    case OrchestrationEventType.REQUEST_ONRAMP:
      return CommerceFlowType.ONRAMP;
    case OrchestrationEventType.REQUEST_ADD_TOKENS:
      return CommerceFlowType.ADD_TOKENS;
    case OrchestrationEventType.REQUEST_PURCHASE:
      return CommerceFlowType.PURCHASE;
    default:
      return null;
  }
}
