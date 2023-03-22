import { Web3Provider } from "@ethersproject/providers";
import { ChainId } from "../types";

export type NetworkDetails = {
  chainIdHex: string;
  chainName: string;
  rpcUrls: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorerUrls?: string[];
}

export const ChainIdNetworkMap = {
  [ChainId.ETHEREUM]: {
    chainIdHex: '0x1', // 1
    chainName: 'Ethereum',
    rpcUrls: ["https://mainnet.infura.io/v3/"],
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    blockExplorerUrls: ['https://etherscan.io/']
  } as NetworkDetails,
  [ChainId.GOERLI]: {
    chainIdHex: '0x5', // 5
    chainName: 'Goerli',
    rpcUrls: ["https://goerli.infura.io/v3/"],
    nativeCurrency: {
      name: 'Goerli Eth',
      symbol: 'ETH',
      decimals: 18
    },
    blockExplorerUrls: ['https://goerli.etherscan.io/']
  },
  [ChainId.POLYGON]: {
    chainIdHex: '0x89', // 137
    chainName: 'Polygon Mainnet',
    rpcUrls: ["https://polygon-rpc.com"],
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18
    },
    blockExplorerUrls: ["https://polygonscan.com/"],
   }
};

export interface SwitchNetworkParams {
  provider: Web3Provider;
  chainId: ChainId;
}
