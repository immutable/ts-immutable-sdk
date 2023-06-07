/**
 * Enum representing possible Wallet Widget event types.
 */
export enum WalletEventType {
  CLOSE_WIDGET = 'close-widget',
  NETWORK_SWITCH = 'network-switch',
  DISCONNECT_WALLET = 'disconnect-wallet',
}

/**
 * Type representing the data emitted by the network switch event.
 * @property {string} network - The name of the selected network.
 * @property {number} chainId - The chain ID of the selected network.
 */
export type WalletNetworkSwitchEvent = {
  network: string;
  chainId: number;
};

export type WalletDisconnectWalletEvent = {};
