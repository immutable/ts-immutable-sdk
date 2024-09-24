import { CheckoutFlowType } from '@imtbl/checkout-sdk';

/** Orchestration Events List */
export const checkoutFlows = [
  CheckoutFlowType.CONNECT,
  CheckoutFlowType.WALLET,
  CheckoutFlowType.SALE,
  CheckoutFlowType.SWAP,
  CheckoutFlowType.BRIDGE,
  CheckoutFlowType.ONRAMP,
  CheckoutFlowType.ADD_FUNDS,
];

/**
 * Check if event is orchestration event
 */
export function isValidCheckoutFlow(flow: string): boolean {
  return checkoutFlows.includes(flow as CheckoutFlowType);
}
