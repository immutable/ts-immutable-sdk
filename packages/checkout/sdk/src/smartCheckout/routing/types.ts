import { BigNumber } from 'ethers';
import { TokenInfo } from '../../types';

export type RoutingCalculatorResult = {
  availableOptions: any[],
  response: RoutingCalculatorResponse,
  fundingRoutes: FundingRoute[],
};

export type RoutingCalculatorResponse = {
  type: 'ROUTES_FOUND' | 'NO_ROUTES' | 'NO_OPTIONS',
  message: string,
};

export type FundingRouteBalanceItem = {
  balance: BigNumber,
  formattedBalance: string,
  token: TokenInfo
};

export type FundingRouteStep = {
  type: 'bridge' | 'onRamp' | 'swap';
  chainId: number,
  asset: FundingRouteBalanceItem,
};

export type FundingRoute = {
  priority: number;
  steps: FundingRouteStep[]
};
