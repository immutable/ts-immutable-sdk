import { Web3Provider } from '@ethersproject/providers';
import { TokenInfo } from './tokenInfo';
import { ChainId } from './chainId';
import { NetworkInfo } from './networkInfo';

/**
 * Object mapping the list of supported networks with the corresponding RPC urls.
 */
export type RpcUrlMap = Map<ChainId, string>;
export const RPC_URL_MAP: RpcUrlMap = new Map<ChainId, string>([
  [ChainId.ETHEREUM, 'https://checkout-api.sandbox.immutable.com/v1/rpc/eth-mainnet'],
  [ChainId.IMTBL_ZKEVM_TESTNET, 'https://zkevm-rpc.sandbox.x.immutable.com'],
  [ChainId.SEPOLIA, 'https://checkout-api.sandbox.immutable.com/v1/rpc/eth-sepolia'],
  [ChainId.IMTBL_ZKEVM_DEVNET, 'https://zkevm-rpc.dev.x.immutable.com'],
]);

/**
 * Type representing the details of a network.
 * @property {string} chainIdHex - The hexadecimal ID of the network.
 * @property {string} chainName - The name of the network.
 * @property {string[]} rpcUrls - The RPS URLs of the network's node.
 * @property {TokenInfo} nativeCurrency - The info of the network's native currency.
 * @property {string[]} [blockExplorerUrls] - The URLs of the network's block explorer.
 */
export type NetworkDetails = {
  chainIdHex: string;
  chainName: string;
  rpcUrls: string[];
  nativeCurrency: TokenInfo;
  blockExplorerUrls?: string[];
};

/**
 * Type representing the mapping between ChainId and NetworkDetails
 */
export type NetworkMap = Map<ChainId, NetworkDetails>;

/**
 * Object mapping the list of supported production networks with the corresponding network details.
 */
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
      chainIdHex: '0x343C', // 13372
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

/**
 * Object mapping the list of supported sandbox networks with the corresponding network details.
 */
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
      chainIdHex: '0x3447', // 13383
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
 * Interface representing the result of {@link Checkout.switchNetwork}.
 * @property {NetworkInfo} network - The information of the network that was switched to.
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
