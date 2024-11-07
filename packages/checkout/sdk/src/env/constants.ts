import { Environment } from '@imtbl/config';
import { ChainId, ChainName } from '../types/chains';
import { TokenInfo } from '../types/tokenInfo';
import { NetworkDetails, NetworkMap } from '../types';

export const ENV_DEVELOPMENT = 'development' as Environment;

export const DEFAULT_TOKEN_DECIMALS = 18;
export const DEFAULT_TOKEN_FORMATTING_DECIMALS = 6;

export const NATIVE = 'native';

export const ZKEVM_NATIVE_TOKEN = {
  name: 'IMX',
  symbol: 'IMX',
  decimals: DEFAULT_TOKEN_DECIMALS,
  address: NATIVE,
};

export const ZKEVM_NATIVE_SANDBOX_TOKEN = {
  name: 'tIMX',
  symbol: 'tIMX',
  decimals: DEFAULT_TOKEN_DECIMALS,
  address: NATIVE,
};

/**
 * Base URL for the Immutable API based on the environment.
 * @property {string} DEVELOPMENT - The base URL for the development environment.
 * @property {string} SANDBOX - The base URL for the sandbox environment.
 * @property {string} PRODUCTION - The base URL for the production environment.
 */
export const IMMUTABLE_API_BASE_URL = {
  [ENV_DEVELOPMENT]: 'https://api.dev.immutable.com',
  [Environment.SANDBOX]: 'https://api.sandbox.immutable.com',
  [Environment.PRODUCTION]: 'https://api.immutable.com',
};

/**
 * Base URL for the checkout CDN based on the environment.
 * @property {string} DEVELOPMENT - The base URL for the development environment.
 * @property {string} SANDBOX - The base URL for the sandbox environment.
 * @property {string} PRODUCTION - The base URL for the production environment.
 */
export const CHECKOUT_CDN_BASE_URL = {
  [ENV_DEVELOPMENT]: 'https://checkout-api.dev.immutable.com',
  [Environment.SANDBOX]: 'https://checkout-api.sandbox.immutable.com',
  [Environment.PRODUCTION]: 'https://checkout-api.immutable.com',
};

/**
 * Smart Checkout routing default onramp enabled flag
 */
export const DEFAULT_ON_RAMP_ENABLED = true;

/**
 * Smart Checkout routing default swap enabled flag
 */
export const DEFAULT_SWAP_ENABLED = true;

/**
 * Smart Checkout routing default bridge enabled flag
 */
export const DEFAULT_BRIDGE_ENABLED = true;

export const TRANSAK_API_BASE_URL = {
  [Environment.SANDBOX]: 'https://global-stg.transak.com',
  [Environment.PRODUCTION]: 'https://global.transak.com/',
};

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
      nativeCurrency: ZKEVM_NATIVE_TOKEN,
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
      nativeCurrency: ZKEVM_NATIVE_SANDBOX_TOKEN,
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
      nativeCurrency: ZKEVM_NATIVE_TOKEN,
    },
  ],
]);

/**
 * Blockscout API configuration per chain
 */
export const BLOCKSCOUT_CHAIN_URL_MAP: {
  [key: string]: {
    url: string,
    nativeToken: TokenInfo
  }
} = {
  [ChainId.IMTBL_ZKEVM_TESTNET]: {
    url: 'https://explorer.testnet.immutable.com',
    nativeToken: SANDBOX_CHAIN_ID_NETWORK_MAP.get(ChainId.IMTBL_ZKEVM_TESTNET)!.nativeCurrency,
  },
  [ChainId.IMTBL_ZKEVM_MAINNET]: {
    url: 'https://explorer.immutable.com',
    nativeToken: PRODUCTION_CHAIN_ID_NETWORK_MAP.get(ChainId.IMTBL_ZKEVM_MAINNET)!.nativeCurrency,
  },
  [ChainId.SEPOLIA]: {
    url: 'https://eth-sepolia.blockscout.com',
    nativeToken: SANDBOX_CHAIN_ID_NETWORK_MAP.get(ChainId.SEPOLIA)!.nativeCurrency,
  },
  [ChainId.ETHEREUM]: {
    url: 'https://eth.blockscout.com/',
    nativeToken: PRODUCTION_CHAIN_ID_NETWORK_MAP.get(ChainId.ETHEREUM)!.nativeCurrency,
  },
};

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

export const ERC1155ABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
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
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: 'approved',
        type: 'bool',
      },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

// Gas overrides -- Anti-spam mechanism for when the baseFee drops low
// https://docs.immutable.com/docs/zkEVM/architecture/gas-config
export const IMMUTABLE_ZKVEM_GAS_OVERRIDES = {
  maxFeePerGas: BigInt(15e9),
  maxPriorityFeePerGas: BigInt(10e9),
};
