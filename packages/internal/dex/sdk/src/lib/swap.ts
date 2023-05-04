import { MethodParameters, Trade } from '@uniswap/v3-sdk';
import { SwapRouter, SwapOptions } from '@uniswap/router-sdk';
import {
  CurrencyAmount,
  TradeType,
  Percent,
  Currency,
} from '@uniswap/sdk-core';
import JSBI from 'jsbi';
import { TradeInfo } from '../types';

export async function createSwapParameters(
  trade: TradeInfo,
  fromAddress: string,
  slippage: Percent,
  deadline: number,
): Promise<MethodParameters> {
  // Create an unchecked trade to be used in generating swap parameters.
  const uncheckedTrade: Trade<Currency, Currency, TradeType> = Trade.createUncheckedTrade({
    route: trade.route,
    inputAmount: CurrencyAmount.fromRawAmount(
      trade.tokenIn,
      JSBI.BigInt(trade.amountIn.toString()),
    ),
    outputAmount: CurrencyAmount.fromRawAmount(
      trade.tokenOut,
      JSBI.BigInt(trade.amountOut.toString()),
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
