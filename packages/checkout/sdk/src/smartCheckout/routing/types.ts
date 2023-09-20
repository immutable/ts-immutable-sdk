import { BigNumber } from 'ethers';
import { Amount, Quote } from '@imtbl/dex-sdk';
import {
  ChainId, FundingRouteType, GetBalanceResult, TokenInfo,
} from '../../types';
import { CheckoutError } from '../../errors';

export type RoutingCalculatorResult = {
  response: RoutingCalculatorResponse,
  fundingRoutes: FundingRoute[],
};

export enum RouteCalculatorType {
  ROUTES_FOUND = 'ROUTES_FOUND',
  NO_ROUTES = 'NO_ROUTES',
  NO_OPTIONS = 'NO_OPTIONS',
}

export type RoutingCalculatorResponse = {
  type: RouteCalculatorType,
  message: string,
};

export type FundingRouteBalanceItem = {
  balance: BigNumber,
  formattedBalance: string,
  token: TokenInfo
};

export type FundingRouteStep = {
  type: FundingRouteType;
  chainId: number,
  asset: FundingRouteBalanceItem,
};

export type FundingRoute = {
  priority: number;
  steps: FundingRouteStep[]
};

export type TokenBalanceResult = {
  success: boolean,
  balances: GetBalanceResult[],
  error?: CheckoutError,
};

export type TokenBalances = Map<ChainId, TokenBalanceResult>;

// Map for maintaining quotes between token pairs from the dex
// Used to ensure when we call the swap route multiple times we do not make unnecessary calls to fetch similar quotes via the dex
export type DexQuoteCache = Map<string, DexQuotes>;
export type DexQuotes = Map<string, DexQuote>;
export type DexQuote = {
  quote: Quote,
  approval: Amount | null | undefined,
  swap: Amount | null,
};
