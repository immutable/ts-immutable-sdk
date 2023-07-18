import { GetBalanceResult } from '@imtbl/checkout-sdk';
import { BigNumber } from 'ethers';

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

export const hasEnoughBalanceForGas = (
  tokenBalances: GetBalanceResult[],
  gasFee: BigNumber,
  symbol: string,
) => {
  if (tokenBalances.length === 0) return false;
  let hasEnoughImxBalance = true;
  tokenBalances.filter((b) => b.balance.gt(0) && b.balance.lt(gasFee))
    .forEach((t) => {
      if (t.token.symbol === symbol) {
        hasEnoughImxBalance = false;
      }
    });
  return hasEnoughImxBalance;
};
