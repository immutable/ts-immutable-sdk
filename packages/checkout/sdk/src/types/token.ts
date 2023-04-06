import { ChainId } from './network';

export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  address?: string;
  icon?: string;
}

export interface GetTokenAllowListParams {
  chainId: ChainId;
}

export interface GetTokenAllowListResult {
  tokens: TokenInfo[];
}
