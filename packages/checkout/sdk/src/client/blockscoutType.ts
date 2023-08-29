/* eslint @typescript-eslint/naming-convention: off */

import { HttpStatusCode } from 'axios';

export enum BlockscoutTokenType {
  ERC20 = 'ERC-20',
}

export interface BlockscoutAddressTokens {
  items: BlockscoutAddressToken[]
  next_page_params: BlockscoutAddressTokenPagination | null
}

export interface BlockscoutAddressTokenPagination { [key: string]: string | number | null }

export interface BlockscoutAddressToken {
  token: BlockscoutAddressTokenData;
  value: string;
}

export interface BlockscoutAddressTokenData {
  address: string
  decimals: string
  name: string
  symbol: string
  type: BlockscoutTokenType
}

export interface BlockscoutError {
  code: HttpStatusCode,
  message: string
}
