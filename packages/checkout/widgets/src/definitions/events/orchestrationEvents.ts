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
 * Represents the event object for a request to connect to a wallet provider.
 * @property {string} walletProvider - The name of the wallet provider.
 */
export type RequestConnectEvent = {
  walletProvider: string;
};

/**
 * Represents an event that requests a wallet provider.
 * @property {string} walletProvider - The requested wallet provider.
 */
export type RequestWalletEvent = {
  walletProvider: string;
};

/**
 * Represents an event where a token swap is requested.
 * @property {string} fromTokenAddress - The address of the token to swap from.
 * @property {string} toTokenAddress - The address of the token to swap to.
 * @property {string} amount - The amount of tokens to swap.
 */
export type RequestSwapEvent = {
  fromTokenAddress: string;
  toTokenAddress: string;
  amount: string;
};

/**
 * Represents a request bridge event object.
 * @property {string} tokenAddress - The address of the token.
 * @property {string} amount - The amount of the token.
 */
export type RequestBridgeEvent = {
  tokenAddress: string;
  amount: string;
};

/**
 * Represents an event that is triggered when a request is made to onboard a user onto a platform.
 * @property {string} tokenAddress - The address of the token to be used for onramping.
 * @property {string} amount - The amount of tokens to be onramped.
 */
export type RequestOnrampEvent = {
  tokenAddress: string;
  amount: string;
};
