import { CommerceFlowType } from '@imtbl/checkout-sdk';

/** Orchestration Events List */
export const commerceFlows = [
  CommerceFlowType.CONNECT,
  CommerceFlowType.WALLET,
  CommerceFlowType.SALE,
  CommerceFlowType.SWAP,
  CommerceFlowType.BRIDGE,
  CommerceFlowType.ONRAMP,
  CommerceFlowType.ADD_FUNDS,
];

/**
 * Check if event is orchestration event
 */
export function isValidCommerceFlow(flow: string): boolean {
  return commerceFlows.includes(flow as CommerceFlowType);
}
