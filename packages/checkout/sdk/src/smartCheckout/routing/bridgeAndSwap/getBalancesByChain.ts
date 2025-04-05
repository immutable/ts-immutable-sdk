import { CheckoutConfiguration } from '../../../config';
import { ChainId, GetBalanceResult } from '../../../types';
import { TokenBalanceResult } from '../types';

export const getBalancesByChain = (
  config: CheckoutConfiguration,
  tokenBalances: Map<ChainId, TokenBalanceResult>,
): {
  l1balances: GetBalanceResult[],
  l2balances: GetBalanceResult[],
} => {
  const balances = { l1balances: [], l2balances: [] };

  const l1balancesResult = tokenBalances.get(config.l1ChainId);
  const l2balancesResult = tokenBalances.get(config.l2ChainId);

  // If there are no l1 balance then cannot bridge
  if (!l1balancesResult) return balances;
  if (l1balancesResult.error !== undefined) return balances;
  if (!l1balancesResult.success) return balances;

  // If there are no l2 balance then cannot swap
  if (!l2balancesResult) return balances;
  if (l2balancesResult.error !== undefined) return balances;
  if (!l2balancesResult.success) return balances;

  const l1balances = l1balancesResult.balances;
  const l2balances = l2balancesResult.balances;

  return { l1balances, l2balances };
};
