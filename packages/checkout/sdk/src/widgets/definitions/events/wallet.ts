import { BrowserProvider } from "ethers";

/**
 * Enum representing possible Wallet Widget event types.
 */
export enum WalletEventType {
  CLOSE_WIDGET = 'close-widget',
  NETWORK_SWITCH = 'network-switch',
  DISCONNECT_WALLET = 'disconnect-wallet',
  LANGUAGE_CHANGED = 'language-changed',
}

/**
 * Represents an event that is triggered when the user switches the network in their wallet.
 * @property {string} network
 * @property {number} chainId
 * @property {BrowserProvider} provider
 */
export type WalletNetworkSwitch = {
  /**  The name of the network that the user switched to. */
  network: string;
  /**  The chain ID of the network that the user switched to. */
  chainId: number;
  /** The Web3 provider object for the switched network. */
  provider: BrowserProvider;
};

/**
 * Represents an event that is triggered when a wallet is disconnected.
 */
export type WalletDisconnect = {};
