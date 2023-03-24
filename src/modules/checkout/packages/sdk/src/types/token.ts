export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  address?: string;
  icon?: string;
}

export interface GetTokenAllowListResult {
  tokens: TokenInfo[];
}
