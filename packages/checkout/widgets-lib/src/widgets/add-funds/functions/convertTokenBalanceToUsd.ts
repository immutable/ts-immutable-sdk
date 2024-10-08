import { TokenBalance } from '@0xsquid/sdk/dist/types';
import { RouteResponse } from '@0xsquid/squid-types';
import { ethers } from 'ethers';
import { RouteData } from '../types';

export function convertTokenBalanceToUsd(
  balance: TokenBalance,
  routeResponse: RouteResponse,
): number {
  const { usdPrice } = routeResponse.route.estimate.fromToken;

  if (!usdPrice) {
    throw new Error('USD conversion rate not available');
  }

  const tokenBalance = ethers.utils.formatUnits(
    balance.balance,
    balance.decimals,
  );

  const usdBalance = parseFloat(tokenBalance) * usdPrice;

  return usdBalance;
}

export const getUsdBalance = (
  balance: TokenBalance | undefined,
  route: RouteData,
) => {
  if (!balance) return '';

  try {
    return convertTokenBalanceToUsd(balance, route.route)?.toString();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error calculating USD balance:', error);
    return '';
  }
};
