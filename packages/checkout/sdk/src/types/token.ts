import { ChainId } from './network';

export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  address?: string;
  icon?: string;
}

export interface TokenMasterInfo extends TokenInfo {
  chainId: ChainId,
  tokenFeatures: TokenFilterTypes[]
}

export interface GetTokenAllowListParams {
  type: TokenFilterTypes,
  chainId: ChainId,
  exclude?: TokenFilter[],
}

export interface GetTokenAllowListResult {
  tokens: TokenInfo[];
}

export enum TokenFilterTypes {
  SWAP = "swap",
  BRIDGE = "bridge",
  ALL = "all"
}

export interface TokenFilter {
  address: string,
}