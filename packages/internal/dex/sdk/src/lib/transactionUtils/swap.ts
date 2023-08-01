import {
  Trade, toHex, encodeRouteToPath, Route,
} from '@uniswap/v3-sdk';
import { SwapRouter } from '@uniswap/router-sdk';
import {
  Currency,
  CurrencyAmount,
  Percent,
  TradeType,
} from '@uniswap/sdk-core';
import JSBI from 'jsbi';
import { ethers } from 'ethers';
import { QuoteResponse, QuoteTradeInfo } from 'lib/router';
import { SecondaryFee__factory } from 'contracts/types';
import { ISecondaryFee, SecondaryFeeInterface } from 'contracts/types/SecondaryFee';
import {
  SecondaryFee,
  TokenInfo, TransactionDetails,
} from '../../types';
import { calculateGasFee } from './gas';
import { slippageToFraction } from './slippage';

type SwapOptions = {
  slippageTolerance: Percent;
  deadlineOrPreviousBlockhash: number;
  recipient: string;
};

const zeroNativeCurrencyValue = '0x00';
const multicallWithDeadlineFunctionSignature = 'multicall(uint256,bytes[])';

function buildSwapParametersForSinglePoolSwap(
  fromAddress: string,
  trade: Trade<Currency, Currency, TradeType>,
  route: Route<Currency, Currency>,
  amountIn: string,
  amountOut: string,
  secondaryFees: SecondaryFee[],
  secondaryFeeContract: SecondaryFeeInterface,
) {
  const secondaryFeeValues: ISecondaryFee.ServiceFeeParamsStruct[] = secondaryFees.map((fee) => ({
    feePrcntBasisPoints: fee.feeBasisPoints,
    recipient: fee.feeRecipient,
  }));

  if (trade.tradeType === TradeType.EXACT_INPUT) {
    return secondaryFeeContract.encodeFunctionData('exactInputSingleWithServiceFee', [secondaryFeeValues, {
      tokenIn: route.tokenPath[0].address,
      tokenOut: route.tokenPath[1].address,
      fee: route.pools[0].fee,
      recipient: fromAddress,
      amountIn,
      amountOutMinimum: amountOut,
      sqrtPriceLimitX96: 0,
    }]);
  }

  return secondaryFeeContract.encodeFunctionData('exactOutputSingleWithServiceFee', [secondaryFeeValues, {
    tokenIn: route.tokenPath[0].address,
    tokenOut: route.tokenPath[1].address,
    fee: route.pools[0].fee,
    recipient: fromAddress,
    amountInMaximum: amountIn,
    amountOut,
    sqrtPriceLimitX96: 0,
  }]);
}

function buildSwapParametersForMultiPoolSwap(
  fromAddress: string,
  trade: Trade<Currency, Currency, TradeType>,
  route: Route<Currency, Currency>,
  amountIn: string,
  amountOut: string,
  secondaryFees: SecondaryFee[],
  secondaryFeeContract: SecondaryFeeInterface,
) {
  const path: string = encodeRouteToPath(route, trade.tradeType === TradeType.EXACT_OUTPUT);

  const secondaryFeeValues: ISecondaryFee.ServiceFeeParamsStruct[] = secondaryFees.map((fee) => ({
    feePrcntBasisPoints: fee.feeBasisPoints,
    recipient: fee.feeRecipient,
  }));

  if (trade.tradeType === TradeType.EXACT_INPUT) {
    return secondaryFeeContract.encodeFunctionData('exactInputWithServiceFee', [secondaryFeeValues, {
      path,
      recipient: fromAddress,
      amountIn,
      amountOutMinimum: amountOut,
    }]);
  }

  return secondaryFeeContract.encodeFunctionData('exactOutputWithServiceFee', [secondaryFeeValues, {
    path,
    recipient: fromAddress,
    amountInMaximum: amountIn,
    amountOut,
  }]);
}

/**
 * Builds swap parameters
 * @param fromAddress the msg.sender of the transaction
 * @param secondaryFeeAddress the secondary fee contract address
 * @param trade details of the swap, including the route, input/output tokens and amounts
 * @param options additional swap options
 * @returns calldata for the swap
 */
function buildSwapParameters(
  fromAddress: string,
  trade: Trade<Currency, Currency, TradeType>,
  options: SwapOptions,
  secondaryFees: SecondaryFee[],
  secondaryFeeContract: SecondaryFeeInterface,
) {
  // @dev we don't support multiple swaps in a single transaction
  // there will always be only one swap in the trade regardless of the trade type
  const { route, inputAmount, outputAmount } = trade.swaps[0];
  const amountIn: string = toHex(trade.maximumAmountIn(options.slippageTolerance, inputAmount).quotient);
  const amountOut: string = toHex(trade.minimumAmountOut(options.slippageTolerance, outputAmount).quotient);

  const isSinglePoolSwap = route.pools.length === 1;

  if (isSinglePoolSwap) {
    return buildSwapParametersForSinglePoolSwap(
      fromAddress,
      trade,
      route,
      amountIn,
      amountOut,
      secondaryFees,
      secondaryFeeContract,
    );
  }

  return buildSwapParametersForMultiPoolSwap(
    fromAddress,
    trade,
    route,
    amountIn,
    amountOut,
    secondaryFees,
    secondaryFeeContract,
  );
}

function createSwapCallParametersWithFees(
  trade: Trade<Currency, Currency, TradeType>,
  fromAddress: string,
  swapOptions: SwapOptions,
  secondaryFees: SecondaryFee[],
): string {
  const secondaryFeeContract = SecondaryFee__factory.createInterface();

  const swapWithFeesCalldata = buildSwapParameters(
    fromAddress,
    trade,
    swapOptions,
    secondaryFees,
    secondaryFeeContract,
  );

  return secondaryFeeContract.encodeFunctionData(
    multicallWithDeadlineFunctionSignature,
    [swapOptions.deadlineOrPreviousBlockhash, [swapWithFeesCalldata]],
  );
}

function createSwapParameters(
  trade: QuoteTradeInfo,
  fromAddress: string,
  slippage: number,
  deadline: number,
  secondaryFees: SecondaryFee[],
): string {
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

  if (secondaryFees.length === 0) {
    // Generate swap parameters without secondary fee contract details
    return SwapRouter.swapCallParameters([uncheckedTrade], options).calldata;
  }

  return createSwapCallParametersWithFees(uncheckedTrade, fromAddress, options, secondaryFees);
}

export function getSwap(
  nativeToken: TokenInfo,
  routeAndQuote: QuoteResponse,
  fromAddress: string,
  slippage: number,
  deadline: number,
  peripheryRouterAddress: string,
  secondaryFeesAddress: string,
  gasPrice: ethers.BigNumber | null,
  secondaryFees: SecondaryFee[],
): TransactionDetails {
  const calldata = createSwapParameters(
    routeAndQuote.trade,
    fromAddress,
    slippage,
    deadline,
    secondaryFees,
  );

  // TODO: Add additional gas fee estimates for secondary fees
  const gasFeeEstimate = gasPrice ? {
    token: nativeToken,
    value: calculateGasFee(gasPrice, routeAndQuote.trade.gasEstimate),
  } : null;

  return {
    transaction: {
      data: calldata,
      to: secondaryFees.length > 0 ? secondaryFeesAddress : peripheryRouterAddress,
      value: zeroNativeCurrencyValue, // we should never send the native currency to the router for a swap
      from: fromAddress,
    },
    gasFeeEstimate,
  };
}
