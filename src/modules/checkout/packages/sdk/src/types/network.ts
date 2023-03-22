import { TokenInfo } from "./token";

export enum ChainId {
  ETHEREUM = 1,
  GOERLI = 5,
  POLYGON = 137,
  // zkEVM = 'zkEVM'
}

export interface NetworkInfo {
  name: string;
  chainID: string;
  nativeCurrency: TokenInfo;
}
