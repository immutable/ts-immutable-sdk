import { Web3Provider } from '@ethersproject/providers';
import { ChainId } from './chains';
import { NetworkInfo } from './networkInfo';

/**
 * Interface representing the parameters for {@link Checkout.switchNetwork}.
 * @property {Web3Provider} provider - The provider to connect to the network.
 * @property {ChainId} chainId - The ID of the network to switch to.
 */
export interface SwitchNetworkParams {
  provider: Web3Provider;
  chainId: ChainId;
}

/**
 * Represents the result of switching the network in a Web3 application {@link Checkout.switchNetwork}.
 * @interface SwitchNetworkResult
 * @property {NetworkInfo} network - The information about the switched network.
 * @property {Web3Provider} provider - The Web3 provider for the switched network.
 */
export interface SwitchNetworkResult {
  network: NetworkInfo;
  provider: Web3Provider;
}

/**
 * * Interface representing the parameters for {@link Checkout.getNetworkInfo}.
 * @property {Web3Provider} provider - The provider to connect to the network.
 */
export interface GetNetworkParams {
  provider: Web3Provider;
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
