import { MethodParameters, Trade } from '@uniswap/v3-sdk';
import { SwapOptions, SwapRouter } from '@uniswap/router-sdk';
import {
  Currency,
  CurrencyAmount,
  TradeType,
} from '@uniswap/sdk-core';
import JSBI from 'jsbi';
import { ethers } from 'ethers';
import { IV3SwapRouter } from 'contracts/types/SecondaryFee';
import { QuoteResponse, QuoteTradeInfo } from 'lib/router';
import {
  TokenInfo, TransactionDetails,
} from '../../types';
import { calculateGasFee } from './gas';
import { slippageToFraction } from './slippage';

const exactInputOutputSingleParamTypes = [
  'address',
  'address',
  'uint24',
  'address',
  'uint256',
  'uint256',
  'uint160',
];

function createSwapParameters(
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

export function createSwapParametersWithFees(
  trade: QuoteTradeInfo,
  fromAddress: string,
  slippage: number,
  deadline: number,
): {
  } {
  // TODO: This is only for ExactInputSingle/ExactOutputSingle at the moment
  const tx = createSwapParameters(trade, fromAddress, slippage, deadline);
  // Remove the first 100 bytes of the calldata for the swap
  // - 4 bytes for the function selector
  // - 32 bytes for the deadline
  // - 32 bytes for the offset
  // - 32 bytes for the array size
  const data = ethers.utils.hexDataSlice(tx.calldata, 100);

  console.log({calldatabefore: tx.calldata})
  console.log({calldataafter: data})

  const decodedTopLevelParams = ethers.utils.defaultAbiCoder.decode(
    ['bytes'],
    data,
  );

  console.log({ params: decodedTopLevelParams });

  const calldata = decodedTopLevelParams[0];
  console.log({ calldata: calldata });
  const calldataParams = ethers.utils.hexDataSlice(calldata, 4);
  const decodedFunctionCallParams = ethers.utils.defaultAbiCoder.decode(
    exactInputOutputSingleParamTypes,
    calldataParams,
  );
  console.log({ decodedFunctionCallParams: decodedFunctionCallParams });

  const params: IV3SwapRouter.ExactInputSingleParamsStruct = {
    tokenIn: decodedFunctionCallParams[0],
    tokenOut: decodedFunctionCallParams[1],
    fee: decodedFunctionCallParams[2],
    recipient: decodedFunctionCallParams[3],
    amountIn: decodedFunctionCallParams[4],
    amountOutMinimum: decodedFunctionCallParams[5],
    sqrtPriceLimitX96: decodedFunctionCallParams[6],
  };

  return { topLevelParams: decodedTopLevelParams, functionCallParams: params };
}

export function getSwap(
  nativeToken: TokenInfo,
  routeAndQuote: QuoteResponse,
  fromAddress: string,
  slippage: number,
  deadline: number,
  peripheryRouterAddress: string,
  gasPrice: ethers.BigNumber | null,
  // add fees
): TransactionDetails {
  // if fees, use createSwapParametersWithFees
  createSwapParametersWithFees(
    routeAndQuote.trade,
    fromAddress,
    slippage,
    deadline,
  );

  const params = createSwapParameters(
    routeAndQuote.trade,
    fromAddress,
    slippage,
    deadline,
  );

  const gasFeeEstimate = gasPrice ? {
    token: nativeToken,
    value: calculateGasFee(gasPrice, routeAndQuote.trade.gasEstimate),
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
