import { Web3Provider } from '@ethersproject/providers';

/**
 * Enum representing possible Wallet Widget event types.
 */
export enum WalletEventType {
  CLOSE_WIDGET = 'close-widget',
  NETWORK_SWITCH = 'network-switch',
  DISCONNECT_WALLET = 'disconnect-wallet',
}

/**
 * Represents an event that is triggered when the user switches the network in their wallet.
 * @property {string} network - The name of the network that the user switched to.
 * @property {number} chainId - The chain ID of the network that the user switched to.
 * @property {Web3Provider} provider - The Web3 provider object for the switched network.
 */
export type WalletNetworkSwitchEvent = {
  network: string;
  chainId: number;
  provider: Web3Provider;
};

/**
 * Represents an event that is triggered when a wallet is disconnected.
 */
export type WalletDisconnectWalletEvent = {};
