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

export type DexQuotes = Map<string, DexQuote>;
export type DexQuote = {
  quote: Quote,
  approval: Amount | null,
  swap: Amount | null,
};
