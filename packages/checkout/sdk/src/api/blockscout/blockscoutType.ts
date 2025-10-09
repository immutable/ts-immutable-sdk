/* eslint @typescript-eslint/naming-convention: off */

import { HttpStatusCode } from 'axios';

export enum BlockscoutTokenType {
  ERC20 = 'ERC-20',
}

export interface BlockscoutERC20Response {
  items: BlockscoutERC20ResponseItem[]
  next_page_params: BlockscoutTokenPagination | null
}

export interface BlockscoutERC20ResponseItem {
  token: {
    address_hash: string
    decimals: string
    name: string
    symbol: string
    holders_count: string
    circulating_market_cap: string
    exchange_rate: string
    total_supply: string
    icon_url: string;
    type: BlockscoutTokenType
  }
  value: string
  token_id: string | null
  token_instance: string | null
}

export interface BlockscoutTokens {
  items: BlockscoutToken[]
  next_page_params: BlockscoutTokenPagination | null
}

export interface BlockscoutTokenPagination { [key: string]: string | number | null }

export interface BlockscoutToken {
  token: BlockscoutTokenData | BlockscoutNativeTokenData;
  value: string;
}

export interface BlockscoutTokenData {
  address: string
  decimals: string
  name: string
  symbol: string
  icon_url: string;
  holders: string;
  type: BlockscoutTokenType
}

export interface BlockscoutError {
  code: HttpStatusCode,
  message: string
}

export interface BlockscoutNativeTokenData {
  address: string
  decimals: string
  name: string
  symbol: string
}
