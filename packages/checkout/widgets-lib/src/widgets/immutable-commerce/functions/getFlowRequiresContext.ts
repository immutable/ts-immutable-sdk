import { CommerceFlowType } from '@imtbl/checkout-sdk';

/**
 * List of views that require a connect loader wrapper
 */
const connectLoaderFlows = [
  CommerceFlowType.SALE,
  CommerceFlowType.SWAP,
  CommerceFlowType.WALLET,
  CommerceFlowType.ONRAMP,
  CommerceFlowType.TRANSFER,
] as unknown[];

/**
 * List of views that require a providers context wrapper
 */
const providersContextFlows = [
  CommerceFlowType.ADD_TOKENS,
  CommerceFlowType.PURCHASE,
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
