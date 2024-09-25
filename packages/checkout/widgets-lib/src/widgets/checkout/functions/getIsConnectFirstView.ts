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
  //
] as unknown[];

/**
 * List of views that can skip connect
 */
const connectFirstViewExceptions = [
  CheckoutFlowType.ONRAMP,
  //
] as unknown[];

/**
 * Check if the given view requires a web3 provider
 */
export function getIsConnectFirstView(
  view: unknown,
  params?: { skipConnect?: boolean },
) {
  if (params?.skipConnect && connectFirstViewExceptions.includes(view)) {
    return false;
  }

  return connectFirstViewList.includes(view);
}
