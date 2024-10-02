import { TokenBalance } from '@0xsquid/sdk/dist/types';
import { RouteResponse } from '@0xsquid/squid-types';
import { ethers } from 'ethers';

export function convertTokenBalanceToUsd(
  balance: TokenBalance,
  routeResponse: RouteResponse,
): number {
  const { usdPrice } = routeResponse.route.estimate.fromToken;

  if (!usdPrice) {
    throw new Error('USD conversion rate not available');
  }

  const tokenBalance = ethers.utils.formatUnits(balance.balance, balance.decimals);

  const usdBalance = parseFloat(tokenBalance) * usdPrice;

  return usdBalance;
}
