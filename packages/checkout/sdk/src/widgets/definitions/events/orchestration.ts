/**
 * Enum representing different types of orchestration events.
 */
export enum OrchestrationEventType {
  REQUEST_CONNECT = 'request-connect',
  REQUEST_WALLET = 'request-wallet',
  REQUEST_SWAP = 'request-swap',
  REQUEST_BRIDGE = 'request-bridge',
  REQUEST_ONRAMP = 'request-onramp',
  REQUEST_ADD_FUNDS = 'request-add-funds',
  REQUEST_GO_BACK = 'request-go-back',
}

/**
 * Represents the connect event object when the connect widget is requested.
 * @property {string} walletProviderName
 */
export type RequestConnectEvent = {
  /** The wallet provider name. */
  walletProviderName: string;
};

/**
 * Represents the wallet event object when the wallet widget is requested.
 * @property {string} walletProviderName
 */
export type RequestWalletEvent = {
  /** The wallet provider name. */
  walletProviderName: string;
};

/**
 * Represents the swap event object when the swap widget is requested.
 * @property {string} fromTokenAddress
 * @property {string} toTokenAddress
 * @property {string} amount
 */
export type RequestSwapEvent = {
  /** The address of the token to swap from. */
  fromTokenAddress: string;
  /** The address of the token to swap to. */
  toTokenAddress: string;
  /** The amount of from tokens to swap. */
  amount: string;
};

/**
 * Represents the bridge event object when the bridge widget is requested.
 * @property {string} tokenAddress
 * @property {string} amount
 */
export type RequestBridgeEvent = {
  /** The address of the token to bridge. */
  tokenAddress: string;
  /** The amount of tokens to bridge. */
  amount: string;
};

/**
 * Represents the onramp event object when the onramp widget is requested.
 * @property {string} tokenAddress
 * @property {string} amount
 */
export type RequestOnrampEvent = {
  /** The address of the token to be used for onramp. */
  tokenAddress: string;
  /** The amount of tokens to onramp. */
  amount: string;
};

/**
 * Represents the add funds event object when the add funds widget is requested.
 */
export type RequestAddFundsEvent = {
};

/**
 * Represents the object provide after go back event is requested
 */
export type RequestGoBackEvent = {
};

/*
* Type representing the orchestration events.
*/
export type OrchestrationEventData =
  RequestConnectEvent
  | RequestWalletEvent
  | RequestSwapEvent
  | RequestBridgeEvent
  | RequestOnrampEvent
  | RequestGoBackEvent;
