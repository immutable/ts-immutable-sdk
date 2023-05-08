import { MethodParameters, Trade } from '@uniswap/v3-sdk';
import { SwapRouter, SwapOptions, ONE } from '@uniswap/router-sdk';
import { Amount, QuoteTradeInfo, TradeInfo } from '../types';
import {
  CurrencyAmount,
  TradeType,
  Percent,
  Currency,
  Fraction,
} from '@uniswap/sdk-core';
import JSBI from 'jsbi';
import { ethers } from 'ethers';

export async function createSwapParameters(
  trade: QuoteTradeInfo,
  fromAddress: string,
  slippage: Percent,
  deadline: number
): Promise<MethodParameters> {
  // Create an unchecked trade to be used in generating swap parameters.
  const uncheckedTrade: Trade<Currency, Currency, TradeType> =
    Trade.createUncheckedTrade({
      route: trade.route,
      inputAmount: CurrencyAmount.fromRawAmount(
        trade.tokenIn,
        JSBI.BigInt(trade.amountIn.toString())
      ),
      outputAmount: CurrencyAmount.fromRawAmount(
        trade.tokenOut,
        JSBI.BigInt(trade.amountOut.toString())
      ),
      tradeType: trade.tradeType,
    });

  const options: SwapOptions = {
    slippageTolerance: slippage,
    recipient: fromAddress,
    deadlineOrPreviousBlockhash: deadline,
  };

  // Generate the parameters.
  return SwapRouter.swapCallParameters([uncheckedTrade], options);
}

export function getAmountWithSlippageImpact(
  tradeType: TradeType,
  amount: ethers.BigNumber,
  slippagePercent: Percent
): ethers.BigNumber {
  // TODO: comeback to calculate the impact
  console.log('amount', amount.toString());
  const s = ethers.BigNumber.from(slippagePercent.toSignificant());
  console.log('s', s.toString());
  const slippageEffect = amount.mul(slippagePercent.toSignificant());
  console.log('slippage', slippageEffect.toString());

  return amount;
}
