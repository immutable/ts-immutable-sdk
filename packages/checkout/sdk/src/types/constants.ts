import { Environment } from '@imtbl/config';
import { ChainId, ChainName } from './chains';
import { TokenInfo } from './tokenInfo';

export const ENV_DEVELOPMENT = 'development' as Environment;

/**
 * Base URL for the checkout API based on the environment.
 * @property {string} DEVELOPMENT - The base URL for the development environment.
 * @property {string} SANDBOX - The base URL for the sandbox environment.
 * @property {string} PRODUCTION - The base URL for the production environment.
 */
export const CHECKOUT_API_BASE_URL = {
  [ENV_DEVELOPMENT]: 'https://checkout-api.dev.immutable.com',
  [Environment.SANDBOX]: 'https://checkout-api.sandbox.immutable.com',
  [Environment.PRODUCTION]: 'https://checkout-api.immutable.com',
};

export const INTERNAL_RPC_URL = {
  [Environment.SANDBOX]: 'https://zkevm-rpc.sandbox.x.immutable.com',
  [Environment.PRODUCTION]: 'https://zkevm-rpc.x.immutable.com',
};

type NetworkDetails = {
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
      chainIdHex: `0x${ChainId.ETHEREUM.toString(16)}`,
      chainName: ChainName.ETHEREUM,
      rpcUrls: ['https://checkout-api.immutable.com/v1/rpc/eth-mainnet'],
      nativeCurrency: {
        name: ChainName.ETHEREUM,
        symbol: 'ETH',
        decimals: 18,
      },
      blockExplorerUrls: ['https://etherscan.io/'],
    },
  ],
  [
    ChainId.IMTBL_ZKEVM_MAINNET,
    {
      chainIdHex: `0x${ChainId.IMTBL_ZKEVM_MAINNET.toString(16)}`,
      chainName: ChainName.IMTBL_ZKEVM_MAINNET,
      rpcUrls: ['https://rpc.immutable.com'],
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
      chainIdHex: `0x${ChainId.SEPOLIA.toString(16)}`,
      chainName: ChainName.SEPOLIA,
      rpcUrls: [
        'https://checkout-api.sandbox.immutable.com/v1/rpc/eth-sepolia',
      ],
      nativeCurrency: {
        name: 'Sep Eth',
        symbol: 'ETH',
        decimals: 18,
      },
      blockExplorerUrls: ['https://sepolia.etherscan.io/'],
    },
  ],
  [
    ChainId.IMTBL_ZKEVM_TESTNET,
    {
      chainIdHex: `0x${ChainId.IMTBL_ZKEVM_TESTNET.toString(16)}`,
      chainName: ChainName.IMTBL_ZKEVM_TESTNET,
      rpcUrls: ['https://rpc.testnet.immutable.com'],
      nativeCurrency: {
        name: 'IMX',
        symbol: 'IMX',
        decimals: 18,
      },
    },
  ],
]);

export const DEV_CHAIN_ID_NETWORK_MAP: NetworkMap = new Map<
ChainId,
NetworkDetails
>([
  [
    ChainId.SEPOLIA,
    {
      chainIdHex: `0x${ChainId.SEPOLIA.toString(16)}`,
      chainName: ChainName.SEPOLIA,
      rpcUrls: ['https://checkout-api.dev.immutable.com/v1/rpc/eth-sepolia'],
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
      chainIdHex: `0x${ChainId.IMTBL_ZKEVM_DEVNET.toString(16)}`,
      chainName: ChainName.IMTBL_ZKEVM_DEVNET,
      rpcUrls: ['https://zkevm-rpc.dev.x.immutable.com'],
      nativeCurrency: {
        name: 'IMX',
        symbol: 'IMX',
        decimals: 18,
      },
    },
  ],
]);
