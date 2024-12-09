import { TokenBalanceResult } from '../types';
import { isNativeToken } from '../../../tokens';

export const getEthBalance = (
  balances: TokenBalanceResult,
): bigint => {
  for (const balance of balances.balances) {
    if (isNativeToken(balance.token.address)) {
      return balance.balance;
    }
  }

  return BigInt(0);
};
