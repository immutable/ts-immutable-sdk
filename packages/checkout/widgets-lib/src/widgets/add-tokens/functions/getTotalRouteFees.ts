import { RouteResponse } from '@0xsquid/squid-types';

/**
 * Get the total fees for a route
 */
export function getTotalRouteFees(route?: RouteResponse): {
  fees: number;
  feesUsd: number;
  gasFees: number;
  gasFeesUsd: number;
  totalFees: number;
  totalFeesUsd: number;
} {
  const [fees, feesUsd] = route?.route.estimate.feeCosts.reduce(
    ([acc, accUsd], fee) => [
      acc + parseFloat(fee.amount),
      accUsd + parseFloat(fee.amountUsd),
    ],
    [0, 0],
  ) ?? [0, 0];

  const [gasFees, gasFeesUsd] = route?.route.estimate.gasCosts.reduce(
    ([acc, accUsd], fee) => [
      acc + parseFloat(fee.amount),
      accUsd + parseFloat(fee.amountUsd),
    ],
    [0, 0],
  ) ?? [0, 0];

  const totalFees = fees + gasFees;
  const totalFeesUsd = feesUsd + gasFeesUsd;

  return {
    fees,
    feesUsd,
    gasFees,
    gasFeesUsd,
    totalFees,
    totalFeesUsd,
  };
}
