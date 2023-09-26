import { BigNumber } from 'ethers';
import { TokenBalanceResult } from '../types';

export const getEthBalance = (
  balances: TokenBalanceResult,
): BigNumber => {
  for (const balance of balances.balances) {
    if (!balance.token.address || balance.token.address === '') {
      return balance.balance;
    }
  }

  return BigNumber.from(0);
};
