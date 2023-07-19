import { GetBalanceResult } from '@imtbl/checkout-sdk';

export const hasZeroBalance = (tokenBalances: GetBalanceResult[], symbol: string) => {
  if (tokenBalances.length === 0) return true;
  let hasZeroImx = false;
  tokenBalances.filter((b) => b.balance.eq(0))
    .forEach((t) => {
      if (t.token.symbol === symbol) {
        hasZeroImx = true;
      }
    });
  return hasZeroImx;
};
