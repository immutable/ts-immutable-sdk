import { GetBalanceResult } from '@imtbl/checkout-sdk';

export const hasZeroBalance = (tokenBalances: GetBalanceResult[], symbol: string) => {
  if (tokenBalances.length === 0) return true;
  let zeroBalance = false;
  tokenBalances
    .forEach((t) => {
      if (t.token.symbol === symbol && t.balance === 0n) {
        zeroBalance = true;
      }
    });
  return zeroBalance;
};
