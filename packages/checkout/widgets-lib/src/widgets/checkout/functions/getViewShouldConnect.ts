import { CheckoutFlowType } from '@imtbl/checkout-sdk';

const connectFirstViewList = [
  CheckoutFlowType.SALE,
  CheckoutFlowType.SWAP,
  CheckoutFlowType.WALLET,
  CheckoutFlowType.ONRAMP,
  CheckoutFlowType.ADD_FUNDS,
] as unknown[];

export function getViewShouldConnect(view: unknown) {
  return connectFirstViewList.includes(view);
}
