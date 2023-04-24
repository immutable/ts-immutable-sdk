import { Web3Provider } from '@ethersproject/providers';
import { TokenInfo } from './token';

export enum ChainId {
  ETHEREUM = 1,
  GOERLI = 5,
  POLYGON = 137,
  // zkEVM = 'zkEVM'
}

export interface NetworkInfo {
  name: string;
  chainId: number;
  nativeCurrency: TokenInfo;
  isSupported: boolean;
}

export type NetworkDetails = {
  chainIdHex: string;
  chainName: string;
  rpcUrls: string[];
  nativeCurrency: TokenInfo;
  blockExplorerUrls?: string[];
};

export const ChainIdNetworkMap = {
  [ChainId.ETHEREUM]: {
    chainIdHex: '0x1', // 1
    chainName: 'Ethereum',
    rpcUrls: ['https://mainnet.infura.io/v3/'],
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorerUrls: ['https://etherscan.io/'],
  } as NetworkDetails,
  [ChainId.GOERLI]: {
    chainIdHex: '0x5', // 5
    chainName: 'Goerli',
    rpcUrls: ['https://goerli.infura.io/v3/'],
    nativeCurrency: {
      name: 'Goerli Eth',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorerUrls: ['https://goerli.etherscan.io/'],
  },
  [ChainId.POLYGON]: {
    chainIdHex: '0x89', // 137
    chainName: 'Polygon',
    rpcUrls: ['https://polygon-rpc.com'],
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    blockExplorerUrls: ['https://polygonscan.com/'],
  },
};

export interface SwitchNetworkParams {
  provider: Web3Provider;
  chainId: ChainId;
}

export interface SwitchNetworkResult {
  network: NetworkInfo;
}

export enum NetworkFilterTypes {
  ALL = 'all',
}
export interface GetNetworkParams {
  provider: Web3Provider;
}

export enum NetworkFilterTypes {
  ALL = 'all',
}

export interface NetworkFilter {
  chainId: ChainId;
}

export interface GetNetworkAllowListParams {
  type: NetworkFilterTypes;
  exclude?: NetworkFilter[];
}

export interface GetNetworkAllowListResult {
  networks: NetworkInfo[];
}
