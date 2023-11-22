import { BigNumber } from 'ethers';
import { TokenBalanceResult } from '../types';
import { isNativeToken } from '../../../tokens';

export const getEthBalance = (
  balances: TokenBalanceResult,
): BigNumber => {
  for (const balance of balances.balances) {
    if (isNativeToken(balance.token.address)) {
      return balance.balance;
    }
  }

  return BigNumber.from(0);
};
