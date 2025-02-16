import { getFormattedAmounts, getFormattedNumber } from '../../../functions/getFormattedNumber';
import { RouteBalance } from '../../../lib/squid/functions/getRouteAndTokenBalances';

import { DirectCryptoPayData } from '../types';

const emptyRouteBalance: RouteBalance = {
  routeBalance: getFormattedAmounts(''),
  routeBalanceUsd: getFormattedAmounts(''),
  fromAmount: getFormattedAmounts(''),
  fromAmountUsd: getFormattedAmounts(''),
};

export function getRouteAndTokenBalancesForDirectCryptoPay(routeData?: DirectCryptoPayData): RouteBalance {
  if (!routeData) {
    return emptyRouteBalance;
  }
  const { usdPrice } = routeData.amountData.fromToken;

  const routeBalance = getFormattedNumber(
    routeData.amountData.balance.balance,
    routeData.amountData.balance.decimals,
    routeData.amountData.balance.decimals, // preserve precision for usd conversion down below
  );
  const routeBalanceUsd = (parseFloat(routeBalance) * usdPrice).toString();

  const { fromAmount } = routeData.amountData;
  const fromAmountUsd = (parseFloat(fromAmount) * usdPrice).toString();

  return {
    fromAmount,
    fromAmountUsd,
    routeBalance: getFormattedAmounts(routeBalance),
    routeBalanceUsd: getFormattedAmounts(routeBalanceUsd),
  };
}
