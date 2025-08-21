/* eslint @typescript-eslint/naming-convention: off */

import { HttpStatusCode } from 'axios';
import { z } from 'zod';

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

// Zod schemas for runtime validation
export const BlockscoutTokenTypeSchema = z.enum(BlockscoutTokenType);

export const BlockscoutTokenPaginationSchema = z.record(z.string(), z.union([z.string(), z.number(), z.null()]));

export const BlockscoutERC20ResponseItemTokenSchema = z.object({
  address_hash: z.string().refine(
    (val) => val.startsWith('0x'),
    { message: 'address_hash must start with \'0x\'' },
  ),
  decimals: z.string(),
  name: z.string(),
  symbol: z.string(),
  holders_count: z.string(),
  circulating_market_cap: z.string(),
  exchange_rate: z.string(),
  total_supply: z.string(),
  icon_url: z.string(),
  type: BlockscoutTokenTypeSchema,
});

export const BlockscoutERC20ResponseItemSchema = z.object({
  token: BlockscoutERC20ResponseItemTokenSchema,
  value: z.string(),
  token_id: z.union([z.string(), z.null()]),
  token_instance: z.union([z.string(), z.null()]),
});

export const BlockscoutERC20ResponseSchema = z.object({
  items: z.array(BlockscoutERC20ResponseItemSchema),
  next_page_params: z.union([BlockscoutTokenPaginationSchema, z.null()]),
});
