import { Web3Provider } from "@ethersproject/providers";

export enum Network {
  ETHEREUM = 'mainnet',
  GOERLI = 'goerli',
  POLYGON = 'polygon',
  // zkEVM = 'zkEVM'
}

export type NetworkDetails = {
  chainId: string;
  chainName: string;
  rpcUrls: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorerUrls?: string[];
}

export const NetworkMap = {
  [Network.ETHEREUM]: {
    chainId: '0x1', // 1
    chainName: 'Ethereum',
    rpcUrls: ["https://mainnet.infura.io/v3/"],
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    blockExplorerUrls: ['https://etherscan.io/']
  } as NetworkDetails,
  [Network.GOERLI]: {
    chainId: '0x5', // 5
    chainName: 'Goerli',
    rpcUrls: ["https://goerli.infura.io/v3/"],
    nativeCurrency: {
      name: 'Goerli Eth',
      symbol: 'ETH',
      decimals: 18
    },
    blockExplorerUrls: ['https://goerli.etherscan.io/']
  },
  [Network.POLYGON]: {
    chainId: '0x89', // 137
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
  network: Network;
}