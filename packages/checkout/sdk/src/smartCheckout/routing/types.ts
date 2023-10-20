import { Amount, Quote } from '@imtbl/dex-sdk';
import {
  ChainId,
  GetBalanceResult,
} from '../../types';
import { CheckoutError } from '../../errors';

export type TokenBalanceResult = {
  success: boolean,
  balances: GetBalanceResult[],
  error?: CheckoutError,
};

export type TokenBalances = Map<ChainId, TokenBalanceResult>;

// Map for maintaining quotes between token pairs from the dex
// Used to ensure when we call the swap route multiple times we do not make unnecessary calls to fetch similar quotes via the dex
export type DexQuotes = Map<string, DexQuote>;
export type DexQuote = {
  quote: Quote,
  approval: Amount | null,
  swap: Amount | null,
};
