import { MethodParameters, Trade } from '@uniswap/v3-sdk';
import { SwapOptions, SwapRouter } from '@uniswap/router-sdk';
import {
  Currency,
  CurrencyAmount,
  TradeType,
} from '@uniswap/sdk-core';
import JSBI from 'jsbi';
import { ethers } from 'ethers';
import { QuoteResponse, QuoteTradeInfo } from 'lib/router';
import {
  TokenInfo, TransactionDetails,
} from '../../types';
import { calculateGasFee } from './gas';
import { slippageToFraction } from './slippage';

export function createSwapParameters(
  trade: QuoteTradeInfo,
  fromAddress: string,
  slippage: number,
  deadline: number,
): MethodParameters {
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

  const slippageTolerance = slippageToFraction(slippage);
  const options: SwapOptions = {
    slippageTolerance,
    recipient: fromAddress,
    deadlineOrPreviousBlockhash: deadline,
  };

  // Generate the parameters.
  return SwapRouter.swapCallParameters([uncheckedTrade], options);
}

export function getSwap(
  nativeToken: TokenInfo,
  routeAndQuote: QuoteResponse,
  fromAddress: string,
  slippage: number,
  deadline: number,
  peripheryRouterAddress: string,
  gasPrice: ethers.BigNumber | null,
): TransactionDetails {
  const params = createSwapParameters(
    routeAndQuote.trade,
    fromAddress,
    slippage,
    deadline,
  );

  const gasFeeEstimate = gasPrice ? {
    token: nativeToken,
    value: calculateGasFee(gasPrice, routeAndQuote.trade.gasEstimate).toString(),
  } : null;

  return {
    transaction: {
      data: params.calldata,
      to: peripheryRouterAddress,
      value: params.value,
      from: fromAddress,
    },
    gasFeeEstimate,
  };
}
