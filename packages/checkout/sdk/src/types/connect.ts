import { Web3Provider } from '@ethersproject/providers';

/**
 * Interface representing the params of {@link Checkout.connect}.
 * @property {Web3Provider} provider - The provider used to connect to the network.
 * @property {boolean | undefined} requestWalletPermissions - A boolean that will trigger a permission request for wallet connection.
 */
export interface ConnectParams {
  provider: Web3Provider
  requestWalletPermissions?: boolean
}

/**
 * Interface representing the result of {@link Checkout.connect}.
 * @property {Web3Provider} provider - The provider used to connect to the network.
 */
export interface ConnectResult {
  provider: Web3Provider;
}

/**
 * Interface representing the params of {@link Checkout.checkIsWalletConnected}.
 * @property {Web3Provider} provider - The provider used to connect to the network.
 */
export interface CheckConnectionParams {
  provider: Web3Provider
}

/**
 * Interface representing the result of {@link Checkout.checkIsWalletConnected}.
 * @property {boolean} isConnected - A boolean indicating the connection status of the Web3 provider.
 * @property {string} walletAddress - The wallet address used to check the connection.
 */
export interface CheckConnectionResult {
  isConnected: boolean;
  walletAddress: string;
}
