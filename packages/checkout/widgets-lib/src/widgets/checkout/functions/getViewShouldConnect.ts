import { CheckoutFlowType } from '@imtbl/checkout-sdk';

/**
 * List of views that require a connected wallet
 */
const connectFirstViewList = [
  CheckoutFlowType.SALE,
  CheckoutFlowType.SWAP,
  CheckoutFlowType.WALLET,
  CheckoutFlowType.ONRAMP,
  CheckoutFlowType.ADD_FUNDS,
] as unknown[];

/**
 * Check if the given view requires a connected wallet
 */
export function getViewShouldConnect(view: unknown) {
  return connectFirstViewList.includes(view);
}
