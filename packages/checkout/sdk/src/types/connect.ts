import { Web3Provider } from '@ethersproject/providers';
import { NetworkInfo } from './networkInfo';

/**
 * Interface representing the params of {@link Checkout.connect}.
 * @property {Web3Provider} provider - The provider used to connect to the network.
 */
export interface ConnectParams {
  provider: Web3Provider
}

/**
 * Interface representing the result of {@link Checkout.connect}.
 * @property {Web3Provider} provider - The provider used to connect to the network.
 * @property {NetworkInfo} network - Information about the connected network.
 */
export interface ConnectResult {
  provider: Web3Provider;
  network: NetworkInfo;
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
 * @property {boolean} isConnected - A boolean indicating the connection status of th Web3 provider.
 * @property {string} walletAddress - The wallet address used to check the connection.
 */
export interface CheckConnectionResult {
  isConnected: boolean;
  walletAddress: string;
}
