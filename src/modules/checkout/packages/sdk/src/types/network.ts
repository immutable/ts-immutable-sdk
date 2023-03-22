import { TokenInfo } from "./token";

export interface NetworkInfo {
  name: string;
  chainID: string;
  nativeCurrency: TokenInfo;
}