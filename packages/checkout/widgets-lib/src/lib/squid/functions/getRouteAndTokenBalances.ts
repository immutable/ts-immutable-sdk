import { getFormattedAmounts, getFormattedNumber } from '../../../widgets/add-tokens/functions/getFormattedNumber';
import { RouteData } from '../types';

export type RouteBalance = {
  routeBalance: string;
  routeBalanceUsd: string;
  fromAmount: string;
  fromAmountUsd: string;
};

const emptyRouteBalance: RouteBalance = {
  routeBalance: getFormattedAmounts(''),
  routeBalanceUsd: getFormattedAmounts(''),
  fromAmount: getFormattedAmounts(''),
  fromAmountUsd: getFormattedAmounts(''),
};

export function getRouteAndTokenBalances(routeData?: RouteData): RouteBalance {
  if (!routeData) {
    return emptyRouteBalance;
  }

  const usdPrice = routeData?.route.route.estimate.fromToken.usdPrice;
  if (!usdPrice) {
    return emptyRouteBalance;
  }

  const { balance } = routeData.amountData;

  const routeBalance = getFormattedNumber(
    balance.balance,
    balance?.decimals,
    balance?.decimals, // preserve precision for usd conversion down below
  );
  const routeBalanceUsd = (parseFloat(routeBalance) * usdPrice).toString();

  const fromAmount = getFormattedNumber(
    routeData.route.route.estimate.fromAmount,
    routeData.route.route.estimate.fromToken.decimals,
  );
  const fromAmountUsd = getFormattedAmounts(
    routeData.route.route.estimate.fromAmountUSD ?? '',
  );

  return {
    fromAmount,
    fromAmountUsd,
    routeBalance: getFormattedAmounts(routeBalance),
    routeBalanceUsd: getFormattedAmounts(routeBalanceUsd),
  };
}
