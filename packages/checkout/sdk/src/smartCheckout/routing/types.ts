import { BigNumber } from 'ethers';
import { ChainId, GetBalanceResult, TokenInfo } from '../../types';
import { CheckoutError } from '../../errors';

export type RoutingCalculatorResult = {
  availableOptions: any[],
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

export enum FundingRouteType {
  BRIDGE = 'BRIDGE',
  ON_RAMP = 'ONRAMP',
  SWAP = 'SWAP',
}

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
