import { Environment } from '@imtbl/config';
import { ChainId, ChainName } from './chains';
import { TokenInfo } from './tokenInfo';

export const ENV_DEVELOPMENT = 'development' as Environment;
export const IMX_ADDRESS_ZKEVM = '0x0000000000000000000000000000000000001010';
export const DEFAULT_TOKEN_DECIMALS = 18;

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
        address: IMX_ADDRESS_ZKEVM,
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
        address: IMX_ADDRESS_ZKEVM,
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
      rpcUrls: ['https://rpc.dev.immutable.com'],
      nativeCurrency: {
        name: 'IMX',
        symbol: 'IMX',
        decimals: 18,
        address: IMX_ADDRESS_ZKEVM,
      },
    },
  ],
]);

export const ERC20ABI = [
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    payable: false,
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [
      {
        name: '',
        type: 'uint8',
      },
    ],
    payable: false,
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        name: 'balance',
        type: 'uint256',
      },
    ],
    payable: false,
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    payable: false,
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
      {
        name: '_spender',
        type: 'address',
      },
    ],
    name: 'allowance',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_spender',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export const ERC721ABI = [
  {
    constant: false,
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [

    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
    ],
    name: 'isApprovedForAll',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'getApproved',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'ownerOf',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];
