/* eslint @typescript-eslint/naming-convention: off */

import { HttpStatusCode } from 'axios';

export enum BlockscoutTokenType {
  ERC20 = 'ERC-20',
}

export interface BlockscoutTokens {
  items: BlockscoutToken[];
  next_page_params: BlockscoutTokenPagination | null;
}

export interface BlockscoutTokenPagination {
  [key: string]: string | number | null;
}

export type BlockscoutToken = BlockscoutERC20Token | BlockscoutNativeToken;

export interface BlockscoutERC20Token {
  token: BlockscoutERC20TokenData;
  value: string;
}

export interface BlockscoutNativeToken {
  token: BlockscoutNativeTokenData;
  value: string;
}

export interface BlockscoutERC20TokenData {
  address: string;
  decimals: string;
  name: string;
  symbol: string;
  icon_url: string;
  type: BlockscoutTokenType;
  holders: string;
}

export interface BlockscoutError {
  code: HttpStatusCode;
  message: string;
}

export interface BlockscoutNativeTokenData {
  address: string;
  decimals: string;
  name: string;
  symbol: string;
}
