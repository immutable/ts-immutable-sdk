import { Web3Provider } from '@ethersproject/providers';
import { Environment } from '@imtbl/config';
import { TokenInfo } from './tokenInfo';
import { ChainId } from './chainId';
import { NetworkInfo } from './networkInfo';
import { ALCHEMY_PATH, CHECKOUT_API_BASE_URL } from './constants';

/**
 * Represents a mapping of ChainId to RPC URL.
 */
export type RpcUrlMap = Map<ChainId, string>;

/**
 * A map that contains the RPC URLs for different chain IDs.
 * @type {RpcUrlMap}
 */
export const RPC_URL_MAP: RpcUrlMap = new Map<ChainId, string>([
  [
    ChainId.ETHEREUM,
    `${CHECKOUT_API_BASE_URL[Environment.PRODUCTION]}${
      ALCHEMY_PATH[ChainId.ETHEREUM]
    }`,
  ],
  [ChainId.IMTBL_ZKEVM_TESTNET, 'https://zkevm-rpc.sandbox.x.immutable.com'],
  [
    ChainId.SEPOLIA,
    `${CHECKOUT_API_BASE_URL[Environment.PRODUCTION]}${
      ALCHEMY_PATH[ChainId.SEPOLIA]
    }`,
  ],
  [ChainId.IMTBL_ZKEVM_DEVNET, 'https://zkevm-rpc.dev.x.immutable.com'],
]);

export type NetworkDetails = {
  chainIdHex: string;
  chainName: string;
  rpcUrls: string[];
  nativeCurrency: TokenInfo;
  blockExplorerUrls?: string[];
};

export type NetworkMap = Map<ChainId, NetworkDetails>;

export const PRODUCTION_CHAIN_ID_NETWORK_MAP: NetworkMap = new Map<
ChainId,
NetworkDetails
>([
  [
    ChainId.ETHEREUM,
    {
      chainIdHex: '0x1', // 1
      chainName: 'Ethereum',
      rpcUrls: [RPC_URL_MAP.get(ChainId.ETHEREUM) as string],
      nativeCurrency: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
      },
      blockExplorerUrls: ['https://etherscan.io/'],
    },
  ],
  [
    ChainId.IMTBL_ZKEVM_TESTNET,
    {
      chainIdHex: '0x3446', // 13382
      chainName: 'Immutable zkEVM Testnet',
      rpcUrls: [RPC_URL_MAP.get(ChainId.IMTBL_ZKEVM_TESTNET) as string],
      nativeCurrency: {
        name: 'IMX',
        symbol: 'IMX',
        decimals: 18,
      },
    },
  ],
]);

export const SANDBOX_CHAIN_ID_NETWORK_MAP: NetworkMap = new Map<
ChainId,
NetworkDetails
>([
  [
    ChainId.SEPOLIA,
    {
      chainIdHex: '0xaa36a7', // 11155111
      chainName: 'Sepolia',
      rpcUrls: [RPC_URL_MAP.get(ChainId.SEPOLIA) as string],
      nativeCurrency: {
        name: 'Sep Eth',
        symbol: 'ETH',
        decimals: 18,
      },
      blockExplorerUrls: ['https://sepolia.etherscan.io/'],
    },
  ],
  [
    ChainId.IMTBL_ZKEVM_DEVNET,
    {
      chainIdHex: '0x3451', // 13393
      chainName: 'Immutable zkEVM Devnet',
      rpcUrls: [RPC_URL_MAP.get(ChainId.IMTBL_ZKEVM_DEVNET) as string],
      nativeCurrency: {
        name: 'IMX',
        symbol: 'IMX',
        decimals: 18,
      },
    },
  ],
]);

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
