/**
 * Enum representing different types of orchestration events.
 */
export enum OrchestrationEventType {
  REQUEST_CONNECT = 'request-connect',
  REQUEST_WALLET = 'request-wallet',
  REQUEST_SWAP = 'request-swap',
  REQUEST_BRIDGE = 'request-bridge',
  REQUEST_ONRAMP = 'request-onramp',
}

/**
 * Represents the connect event object when the connect widget is requested.
 * @property {string} walletProviderName - The wallet provider name.
 */
export type RequestConnectEvent = {
  walletProviderName: string;
};

/**
 * Represents the wallet event object when the wallet widget is requested.
 * @property {string} walletProviderName - The wallet provider name.
 */
export type RequestWalletEvent = {
  walletProviderName: string;
};

/**
 * Represents the swap event object when the swap widget is requested.
 * @property {string} fromTokenAddress - The address of the token to swap from.
 * @property {string} toTokenAddress - The address of the token to swap to.
 * @property {string} amount - The amount of from tokens to swap.
 */
export type RequestSwapEvent = {
  fromTokenAddress: string;
  toTokenAddress: string;
  amount: string;
};

/**
 * Represents the bridge event object when the bridge widget is requested.
 * @property {string} tokenAddress - The address of the token to bridge.
 * @property {string} amount - The amount of tokens to bridge.
 */
export type RequestBridgeEvent = {
  tokenAddress: string;
  amount: string;
};

/**
 * Represents the onramp event object when the onramp widget is requested.
 * @property {string} tokenAddress - The address of the token to be used for onramp.
 * @property {string} amount - The amount of tokens to onramp.
 */
export type RequestOnrampEvent = {
  tokenAddress: string;
  amount: string;
};

/*
* Type representing the orchestration events.
*/
export type OrchestrationEventData =
  RequestConnectEvent
  | RequestWalletEvent
  | RequestSwapEvent
  | RequestBridgeEvent
  | RequestOnrampEvent;
