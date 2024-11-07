import { Web3Provider } from '@ethersproject/providers';
import { BrowserProvider } from 'ethers';

/**
 * Enum representing different types of orchestration events.
 */
export enum OrchestrationEventType {
  REQUEST_CONNECT = 'request-connect',
  REQUEST_WALLET = 'request-wallet',
  REQUEST_SWAP = 'request-swap',
  REQUEST_BRIDGE = 'request-bridge',
  REQUEST_ONRAMP = 'request-onramp',
  REQUEST_ADD_TOKENS = 'request-add-tokens',
  REQUEST_PURCHASE = 'request-purchase',
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
  /** The connected provider. */
  provider?: BrowserProvider;
};

/**
 * Represents the add tokens event object when the add tokens widget is requested.
 */
export type RequestAddTokensEvent = {
  /** Token address of the fund to be added */
  toTokenAddress?: string;

  /** Amount of the fund to be added */
  toAmount?: string;

  /** Whether to show a back button on the first screen, on click triggers REQUEST_GO_BACK event */
  showBackButton?: boolean;
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
  | RequestConnectEvent
  | RequestWalletEvent
  | RequestSwapEvent
  | RequestBridgeEvent
  | RequestOnrampEvent
  | RequestGoBackEvent
  | RequestAddTokensEvent;
