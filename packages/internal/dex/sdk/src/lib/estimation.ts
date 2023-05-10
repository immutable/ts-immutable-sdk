import { ethers } from 'ethers';
import JSBI from 'jsbi';
import { QuoteResponse } from 'lib';
import { Pool, TickMath } from '@uniswap/v3-sdk';
import { Currency, Percent } from '@uniswap/sdk-core';
import { getXAndY } from './temp';

export function getTokenAmounts(
  liquidity: JSBI,
  sqrtPriceX96: JSBI,
  tickLow: number,
  tickHigh: number,
  token0Decimal: any,
  token1Decimal: any
): [ethers.BigNumber, ethers.BigNumber, string, string] {
  let sqrtRatioA = ethers.BigNumber.from(
    TickMath.getSqrtRatioAtTick(tickLow).toString()
  );
  let sqrtRatioB = ethers.BigNumber.from(
    TickMath.getSqrtRatioAtTick(tickHigh).toString()
  );

  const Q96: any = ethers.BigNumber.from(2).pow(ethers.BigNumber.from(96));

  let currentTick = TickMath.getTickAtSqrtRatio(sqrtPriceX96);

  const sqrtPriceX96BN = ethers.BigNumber.from(sqrtPriceX96.toString());

  let liquidityBN = ethers.BigNumber.from(liquidity.toString());

  let amount0wei = ethers.BigNumber.from(0);
  let amount1wei = ethers.BigNumber.from(0);

  if (currentTick >= tickLow && currentTick < tickHigh) {
    amount0wei = liquidityBN.mul(
      sqrtRatioB
        .sub(sqrtPriceX96BN)
        .div(sqrtPriceX96BN.mul(sqrtRatioB).div(Q96))
    );

    amount1wei = liquidityBN.mul(sqrtPriceX96BN.sub(sqrtRatioA)).div(Q96);
  } else {
    throw new Error('Current tick out of bounds');
  }

  let amount0Human = ethers.utils.formatUnits(amount0wei, token0Decimal);
  let amount1Human = ethers.utils.formatUnits(amount1wei, token1Decimal);

  return [
    ethers.BigNumber.from(amount0wei),
    ethers.BigNumber.from(amount1wei),
    amount0Human,
    amount1Human,
  ];
}

function getSwapFee(amount: ethers.BigNumber, fee: number): ethers.BigNumber {
  // Fees in uniswap are the decimal value multiplied by 1 million.
  // For example, 1% is 0.01 * 1,000,000 = 10,000
  const percentageDivisor = 1000000;
  const poolFee: Percent = new Percent(fee, percentageDivisor);
  const feeAmount = amount
    .mul(poolFee.numerator.toString())
    .div(poolFee.denominator.toString());
  return feeAmount;
}

export type Fee = {
  token: Currency;
  amount: ethers.BigNumber;
};

export const estimateIntermediateSwapFees = (
  routeAndQuote: QuoteResponse
): Fee[] => {
  if (!routeAndQuote.trade) {
    return [];
  }

  const pools: Pool[] = routeAndQuote.trade.route.pools;
  const fees: Fee[] = [];

  // Do the first pool's fees
  let feeAmount = getSwapFee(
    ethers.BigNumber.from(routeAndQuote.trade.amountIn),
    pools[0].fee
  );
  let previousAmountOut: ethers.BigNumber = ethers.BigNumber.from(
    routeAndQuote.trade.amountIn
  ).sub(feeAmount);

  // First fee paid is the overal input token
  fees.push({
    token: routeAndQuote.trade.tokenIn,
    amount: feeAmount,
  });

  const [x, y] = getXAndY(pools[0]);
  console.log(x.toString(), y.toString());

  if (pools.length == 1) {
    return fees;
  }

  // nextTokenIn is the Token that is to be swapped in to the next intermediate swap.
  let nextTokenIn: Currency = routeAndQuote.trade.tokenIn;

  for (let i = 0; i < pools.length - 1; i++) {
    const [x, y] = getXAndY(pools[i]);
    const k: ethers.BigNumber = x.mul(y);

    if (
      nextTokenIn.wrapped.address.toLowerCase() ===
      pools[i].token0.address.toLowerCase()
    ) {
      // tokenIn is x
      const newX = x.add(previousAmountOut.toString());
      const newY = k.div(newX);
      previousAmountOut = y.sub(newY);
      // If the tokenIn for this swap was token0, then the next tokenIn must be token1
      nextTokenIn = pools[i].token1;
    } else if (
      nextTokenIn.wrapped.address.toLowerCase() ===
      pools[i].token1.address.toLowerCase()
    ) {
      //tokenIn is y
      const newY = y.add(previousAmountOut.toString());
      const newX = k.div(newY);
      previousAmountOut = x.sub(newX);
      // If the tokenIn for this swap was token1, then the next tokenIn must be token0
      nextTokenIn = pools[i].token0;
    } else {
      throw Error("Pool path doesn't match token from previous swap");
    }
    // The amountOut from the previous swap is going to be the amount paid in fees for the next swap.
    const feeAmount = getSwapFee(previousAmountOut, pools[i + 1].fee);
    previousAmountOut = previousAmountOut.sub(feeAmount);
    fees.push({
      token: nextTokenIn,
      amount: feeAmount,
    });
  }
  // TODO currently just returning all fees, not aggregated. Should roll up into the first input token and return both.

  // FUN -> USDC -> WETH -> IMX
  // 1. sum = USDC value of WETH fees
  // 2. sum = FUN value of (all USDC fees)
  let sum: ethers.BigNumber = ethers.BigNumber.from(0);
  for (let i = fees.length - 1; i >= 1; i--) {
    const poolBefore = pools[i - 1];
    const [x, y] = getXAndY(pools[i - 1]);

    if (
      fees[i].token.wrapped.address.toLowerCase() ===
      poolBefore.token0.address.toLowerCase()
    ) {
      // Token that fees were paid in is token0, find out how much that is worth in token1
      // fee token is x
      // value of x in y = (y / x) * fees
      // or, more precisely y * fees / x
      sum = y.mul(fees[i].amount.add(sum)).div(x);
    } else if (
      fees[i].token.wrapped.address.toLowerCase() ===
      poolBefore.token1.address.toLowerCase()
    ) {
      // Token that fees were paid in is token1, find out how much that is worth in token0
      sum = x.mul(fees[i].amount.add(sum)).div(y);
    }
  }
  sum = sum.add(fees[0].amount);

  return fees;
};
