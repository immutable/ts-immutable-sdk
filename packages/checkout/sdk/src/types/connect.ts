import { WrappedBrowserProvider } from './provider';

/**
 * Interface representing the params of {@link Checkout.connect}.
 * @property {BrowserProvider} provider - The provider used to connect to the network.
 * @property {boolean | undefined} requestWalletPermissions - A boolean that will trigger a permission request for wallet connection.
 */
export interface ConnectParams {
  provider: WrappedBrowserProvider
  requestWalletPermissions?: boolean
}

/**
 * Interface representing the result of {@link Checkout.connect}.
 * @property {BrowserProvider} provider - The provider used to connect to the network.
 */
export interface ConnectResult {
  provider: WrappedBrowserProvider;
}

/**
 * Interface representing the params of {@link Checkout.checkIsWalletConnected}.
 * @property {BrowserProvider} provider - The provider used to connect to the network.
 */
export interface CheckConnectionParams {
  provider: WrappedBrowserProvider
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
