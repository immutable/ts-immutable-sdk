import { RouteResponse } from '@0xsquid/squid-types';
import { parseUnits } from 'ethers';

export const isRouteToAmountGreaterThanToAmount = (
  routeResponse: RouteResponse,
  toAmount: string,
) => {
  if (!routeResponse?.route?.estimate?.toAmount || !routeResponse?.route?.estimate?.toToken?.decimals) {
    throw new Error('Invalid route response or token decimals');
  }
  const toAmountInBaseUnits = parseUnits(toAmount, routeResponse?.route.estimate.toToken.decimals);
  const routeToAmountInBaseUnits = BigInt(routeResponse.route.estimate.toAmount);
  return routeToAmountInBaseUnits > toAmountInBaseUnits;
};
