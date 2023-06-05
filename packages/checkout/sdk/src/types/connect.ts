import { Web3Provider } from '@ethersproject/providers';
import { NetworkInfo } from './networkInfo';

/**
 * Enum representing the list of default supported providers.
 */
export enum ConnectionProviders {
  METAMASK = 'metamask',
}

export interface CreateProviderParams {
  providerPreference: ConnectionProviders
}

export interface CreateProviderResult {
  provider: Web3Provider;
}

/**
 * Interface representing the parameters for {@link Checkout.connect}.
 * @property {ConnectionProviders} providerPreference - The preferred provider to connect to the network.
 */
export type ConnectParams = {
  providerPreference: ConnectionProviders;
};

/**
 * Interface representing the result of {@link Checkout.connect}.
 * @property {Web3Provider} provider - The provider used to connect to the network.
 * @property {NetworkInfo} network - Information about the connected network.
 */
export interface ConnectResult {
  network: NetworkInfo;
}

/**
 * Interface representing the parameters for {@link Checkout.checkIsWalletConnected}.
 * @property {ConnectionProviders} providerPreference - The preferred provider to use to check the connection status to th Web3 network.
 */
export interface CheckConnectionParams {
  provider: Web3Provider;
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
