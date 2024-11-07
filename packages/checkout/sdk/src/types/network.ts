import { BrowserProvider } from 'ethers';
import { ChainId } from './chains';
import { NetworkInfo } from './networkInfo';
import { TokenInfo } from './tokenInfo';

/**
 * Interface representing the parameters for {@link Checkout.addNetwork}.
 * @property {BrowserProvider} provider - The provider to connect to the network.
 * @property {ChainId} chainId - The ID of the network to add. We only support adding Immutable zkEVM and Immutable zkEVM Testnet.
 */
export interface AddNetworkParams {
  provider: BrowserProvider;
  chainId: ChainId;
}

/**
 * Interface representing the parameters for {@link Checkout.switchNetwork}.
 * @property {BrowserProvider} provider - The provider to connect to the network.
 * @property {ChainId} chainId - The ID of the network to switch to.
 */
export interface SwitchNetworkParams {
  provider: BrowserProvider;
  chainId: ChainId;
}

/**
 * Represents the result of switching the network in a Web3 application {@link Checkout.switchNetwork}.
 * @interface SwitchNetworkResult
 * @property {NetworkInfo} network - The information about the switched network.
 * @property {BrowserProvider} provider - The Web3 provider for the switched network.
 */
export interface SwitchNetworkResult {
  network: NetworkInfo;
  provider: BrowserProvider;
}

/**
 * * Interface representing the parameters for {@link Checkout.getNetworkInfo}.
 * @property {BrowserProvider} provider - The provider to connect to the network.
 */
export interface GetNetworkParams {
  provider: BrowserProvider;
}

/**
 * * Interface representing the parameters for {@link Checkout.getNetworkAllowList}.
 * @property {NetworkFilterTypes} type - The type of allow list filter to apply.
 * @property {NetworkFilter[]} [exclude] - The list of networks to exclude from the allow list.
 */
export interface GetNetworkAllowListParams {
  type: NetworkFilterTypes;
  exclude?: NetworkFilter[];
}

/**
 * Interface representing the result of {@link Checkout.getNetworkAllowList}.
 * @property {NetworkInfo[]} networks - The list of allowed networks.
 */
export interface GetNetworkAllowListResult {
  networks: NetworkInfo[];
}

/**
 * Enum representing the types of filters that can be applied to get the allow list of networks.
 */
export enum NetworkFilterTypes {
  ALL = 'all',
}

/**
 * Interface representing a filter for filtering a specific network.
 * @property {ChainId} chainId - The ID of the network to allow or disallow.
 */
export interface NetworkFilter {
  chainId: ChainId;
}

export type NetworkDetails = {
  chainIdHex: string;
  chainName: string;
  rpcUrls: string[];
  nativeCurrency: TokenInfo;
  blockExplorerUrls?: string[];
};

export type NetworkMap = Map<ChainId, NetworkDetails>;
