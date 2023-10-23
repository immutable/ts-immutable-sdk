import { Trade, toHex, encodeRouteToPath, Route } from '@uniswap/v3-sdk';
import { SwapRouter } from '@uniswap/router-sdk';
import { Token, Percent, TradeType } from '@uniswap/sdk-core';
import { SecondaryFee__factory } from 'contracts/types';
import { ISecondaryFee, SecondaryFeeInterface } from 'contracts/types/SecondaryFee';
import { Fees } from 'lib/fees';
import { toCurrencyAmount, toPublicAmount } from 'lib/utils';
import { QuoteResult } from 'lib/getQuotesForRoutes';
import { NativeTokenService, canUnwrapToken } from 'lib/nativeTokenService';
import { Coin, CoinAmount } from 'types';
import { SecondaryFee, TransactionDetails } from '../../types';
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
  trade: Trade<Token, Token, TradeType>,
  route: Route<Token, Token>,
  amountIn: string,
  amountOut: string,
  secondaryFees: SecondaryFee[],
  secondaryFeeContract: SecondaryFeeInterface,
) {
  const secondaryFeeValues: ISecondaryFee.SecondaryFeeParamsStruct[] = secondaryFees.map((fee) => ({
    feeBasisPoints: fee.basisPoints,
    recipient: fee.recipient,
  }));

  if (trade.tradeType === TradeType.EXACT_INPUT) {
    return secondaryFeeContract.encodeFunctionData('exactInputSingleWithSecondaryFee', [
      secondaryFeeValues,
      {
        tokenIn: route.tokenPath[0].address,
        tokenOut: route.tokenPath[1].address,
        fee: route.pools[0].fee,
        recipient: fromAddress,
        amountIn,
        amountOutMinimum: amountOut,
        sqrtPriceLimitX96: 0,
      },
    ]);
  }

  return secondaryFeeContract.encodeFunctionData('exactOutputSingleWithSecondaryFee', [
    secondaryFeeValues,
    {
      tokenIn: route.tokenPath[0].address,
      tokenOut: route.tokenPath[1].address,
      fee: route.pools[0].fee,
      recipient: fromAddress,
      amountInMaximum: amountIn,
      amountOut,
      sqrtPriceLimitX96: 0,
    },
  ]);
}

function buildSwapParametersForMultiPoolSwap(
  fromAddress: string,
  trade: Trade<Token, Token, TradeType>,
  route: Route<Token, Token>,
  amountIn: string,
  amountOut: string,
  secondaryFees: SecondaryFee[],
  secondaryFeeContract: SecondaryFeeInterface,
) {
  const path: string = encodeRouteToPath(route, trade.tradeType === TradeType.EXACT_OUTPUT);

  const secondaryFeeValues: ISecondaryFee.SecondaryFeeParamsStruct[] = secondaryFees.map((fee) => ({
    feeBasisPoints: fee.basisPoints,
    recipient: fee.recipient,
  }));

  if (trade.tradeType === TradeType.EXACT_INPUT) {
    return secondaryFeeContract.encodeFunctionData('exactInputWithSecondaryFee', [
      secondaryFeeValues,
      {
        path,
        recipient: fromAddress,
        amountIn,
        amountOutMinimum: amountOut,
      },
    ]);
  }

  return secondaryFeeContract.encodeFunctionData('exactOutputWithSecondaryFee', [
    secondaryFeeValues,
    {
      path,
      recipient: fromAddress,
      amountInMaximum: amountIn,
      amountOut,
    },
  ]);
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
  trade: Trade<Token, Token, TradeType>,
  options: SwapOptions,
  secondaryFees: SecondaryFee[],
  secondaryFeeContract: SecondaryFeeInterface,
  maximumAmountIn: string,
  minimumAmountOut: string,
) {
  // @dev we don't support multiple swaps in a single transaction
  // there will always be only one swap in the trade regardless of the trade type
  const { route } = trade.swaps[0];

  const isSinglePoolSwap = route.pools.length === 1;

  if (isSinglePoolSwap) {
    return buildSwapParametersForSinglePoolSwap(
      fromAddress,
      trade,
      route,
      maximumAmountIn,
      minimumAmountOut,
      secondaryFees,
      secondaryFeeContract,
    );
  }

  return buildSwapParametersForMultiPoolSwap(
    fromAddress,
    trade,
    route,
    maximumAmountIn,
    minimumAmountOut,
    secondaryFees,
    secondaryFeeContract,
  );
}

function createSwapCallParametersWithFees(
  trade: Trade<Token, Token, TradeType>,
  fromAddress: string,
  swapOptions: SwapOptions,
  secondaryFees: SecondaryFee[],
  maximumAmountIn: string,
  minimumAmountOut: string,
): string {
  const secondaryFeeContract = SecondaryFee__factory.createInterface();

  const swapWithFeesCalldata = buildSwapParameters(
    fromAddress,
    trade,
    swapOptions,
    secondaryFees,
    secondaryFeeContract,
    maximumAmountIn,
    minimumAmountOut,
  );

  return secondaryFeeContract.encodeFunctionData(multicallWithDeadlineFunctionSignature, [
    swapOptions.deadlineOrPreviousBlockhash,
    [swapWithFeesCalldata],
  ]);
}

function createSwapParameters(
  adjustedQuote: QuoteResult,
  fromAddress: string,
  slippage: number,
  deadline: number,
  secondaryFees: SecondaryFee[],
): { calldata: string; maximumAmountIn: string } {
  // Create an unchecked trade to be used in generating swap parameters.
  const uncheckedTrade = Trade.createUncheckedTrade({
    route: adjustedQuote.route,
    inputAmount: toCurrencyAmount(adjustedQuote.amountIn),
    outputAmount: toCurrencyAmount(adjustedQuote.amountOut),
    tradeType: adjustedQuote.tradeType,
  });

  const slippageTolerance = slippageToFraction(slippage);

  const options: SwapOptions = {
    slippageTolerance,
    recipient: fromAddress,
    deadlineOrPreviousBlockhash: deadline,
  };

  const maximumAmountIn = toHex(uncheckedTrade.maximumAmountIn(options.slippageTolerance).quotient);
  const minimumAmountOut = toHex(uncheckedTrade.minimumAmountOut(options.slippageTolerance).quotient);

  if (secondaryFees.length === 0) {
    // Generate swap parameters without secondary fee contract details
    return { calldata: SwapRouter.swapCallParameters([uncheckedTrade], options).calldata, maximumAmountIn };
  }

  return {
    calldata: createSwapCallParametersWithFees(
      uncheckedTrade,
      fromAddress,
      options,
      secondaryFees,
      maximumAmountIn,
      minimumAmountOut,
    ),
    maximumAmountIn,
  };
}

const getTransactionValue = (tokenIn: Coin, maximumAmountIn: string) =>
  tokenIn.type === 'native' ? maximumAmountIn : zeroNativeCurrencyValue;

export function getSwap(
  tokenIn: Coin,
  adjustedQuote: QuoteResult,
  fromAddress: string,
  slippage: number,
  deadline: number,
  peripheryRouterAddress: string,
  secondaryFeesAddress: string,
  gasPrice: CoinAmount<Coin> | null,
  secondaryFees: SecondaryFee[],
): TransactionDetails {
  // TODO: TP-1651: Include `refundETH` transaction as final step for native Exact Output swaps
  const { calldata, maximumAmountIn } = createSwapParameters(
    adjustedQuote,
    fromAddress,
    slippage,
    deadline,
    secondaryFees,
  );

  // TODO: Add additional gas fee estimates for secondary fees
  const gasFeeEstimate = gasPrice ? calculateGasFee(gasPrice, adjustedQuote.gasEstimate) : null;

  const transactionValue = getTransactionValue(tokenIn, maximumAmountIn);

  return {
    transaction: {
      data: calldata,
      to: secondaryFees.length > 0 ? secondaryFeesAddress : peripheryRouterAddress,
      value: transactionValue,
      from: fromAddress,
    },
    gasFeeEstimate: gasFeeEstimate ? toPublicAmount(gasFeeEstimate) : null,
  };
}

const adjustAmountIn = (
  ourQuote: QuoteResult,
  amountSpecified: CoinAmount<Coin>,
  fees: Fees,
  nativeTokenService: NativeTokenService,
) => {
  if (ourQuote.tradeType === TradeType.EXACT_OUTPUT) {
    // when doing exact output, calculate the fees based on the amountIn
    const amountToAdd = canUnwrapToken(fees.token)
      ? nativeTokenService.unwrapAmount(ourQuote.amountIn)
      : ourQuote.amountIn;
    fees.addAmount(amountToAdd);

    return nativeTokenService.maybeWrapAmount(fees.amountWithFeesApplied());
  }

  return nativeTokenService.maybeWrapAmount(amountSpecified);
};

/**
 * adjustQuoteWithFees adjusts the amountIn of the quote to account for fees
 * EXACT_OUTPUT swaps will have the fees added to the amountIn if there are fees specified
 * EXACT_INPUT swaps will have amountIn set to the user-specified amount
 * @param ourQuote The quote from calling the Quoter contract
 * @param amountSpecified The user-specified amount for the swap (EXACT...)
 * @param fees The fees applied to the swap
 * @param tokenWrapper Helper class for the native token and associated ERC20
 * @returns {QuoteResult} The adjusted quote
 */
export function adjustQuoteWithFees(
  ourQuote: QuoteResult,
  amountSpecified: CoinAmount<Coin>,
  fees: Fees,
  nativeTokenService: NativeTokenService,
): QuoteResult {
  const adjustedAmountIn = adjustAmountIn(ourQuote, amountSpecified, fees, nativeTokenService);

  return {
    gasEstimate: ourQuote.gasEstimate,
    route: ourQuote.route,
    amountIn: adjustedAmountIn,
    amountOut: ourQuote.amountOut,
    tradeType: ourQuote.tradeType,
  };
}
