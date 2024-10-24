import { OrchestrationEventType } from '@imtbl/checkout-sdk';

/** Orchestration Events List */
const orchestrationEvents = [
  OrchestrationEventType.REQUEST_CONNECT,
  OrchestrationEventType.REQUEST_WALLET,
  OrchestrationEventType.REQUEST_SWAP,
  OrchestrationEventType.REQUEST_BRIDGE,
  OrchestrationEventType.REQUEST_ONRAMP,
  OrchestrationEventType.REQUEST_ADD_FUNDS,
  OrchestrationEventType.REQUEST_GO_BACK,
];

/**
 * Check if event is orchestration event
 */
export function isOrchestrationEvent(
  event: CustomEvent<{ type: OrchestrationEventType }>,
): boolean {
  return orchestrationEvents.includes(event.detail.type);
}
