import { CheckoutFlowType } from '@imtbl/checkout-sdk';

/**
 * List of views that require a connect loader wrapper
 */
const connectLoaderFlows = [
  CheckoutFlowType.SALE,
  CheckoutFlowType.SWAP,
  CheckoutFlowType.WALLET,
  CheckoutFlowType.ONRAMP,
] as unknown[];

/**
 * List of views that require a providers context wrapper
 */
const providersContextFlows = [
  CheckoutFlowType.ADD_FUNDS,
] as unknown[];

/**
 * Check if the given view requires a connected wallet
 */
export function isConnectLoaderFlow(view: unknown) {
  return connectLoaderFlows.includes(view);
}

/**
 * Check if the given view requires a providers context wrapper
 */
export function isProvidersContextFlow(view: unknown) {
  return providersContextFlows.includes(view);
}
