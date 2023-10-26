import { Trade, toHex, encodeRouteToPath, Route } from '@uniswap/v3-sdk';
import { PaymentsExtended, SwapRouter } from '@uniswap/router-sdk';
import * as Uniswap from '@uniswap/sdk-core';
import { SecondaryFee__factory } from 'contracts/types';
import { ISecondaryFee, SecondaryFeeInterface } from 'contracts/types/SecondaryFee';
import { Fees } from 'lib/fees';
import { toCurrencyAmount, toPublicAmount } from 'lib/utils';
import { QuoteResult } from 'lib/getQuotesForRoutes';
import { NativeTokenService, canUnwrapToken } from 'lib/nativeTokenService';
import { Coin, CoinAmount } from 'types';
import { Interface } from 'ethers/lib/utils';
import { TEST_ROUTER_ADDRESS } from 'test/utils';
import { SecondaryFee, TransactionDetails } from '../../types';
import { calculateGasFee } from './gas';
import { slippageToFraction } from './slippage';

type SwapOptions = {
  slippageTolerance: Uniswap.Percent;
  deadlineOrPreviousBlockhash: number;
  recipient: string;
};

const zeroNativeCurrencyValue = '0x00';
const multicallWithDeadlineFunctionSignature = 'multicall(uint256,bytes[])';

function buildSinglePoolSwap(
  tokenIn: Coin,
  tokenOut: Coin,
  fromAddress: string,
  trade: Trade<Uniswap.Token, Uniswap.Token, Uniswap.TradeType>,
  route: Route<Uniswap.Token, Uniswap.Token>,
  amountIn: string,
  amountOut: string,
  routerContract: Interface,
  paymentsContract: Interface,
) {
  const isTokenInNative = tokenIn.type === 'native';
  const isTokenOutNative = tokenOut.type === 'native';

  const routerContractTODO = TEST_ROUTER_ADDRESS;

  const calldatas: string[] = [];

  if (trade.tradeType === Uniswap.TradeType.EXACT_INPUT) {
    calldatas.push(
      routerContract.encodeFunctionData('exactInputSingle', [
        {
          tokenIn: route.tokenPath[0].address,
          tokenOut: route.tokenPath[1].address,
          fee: route.pools[0].fee,
          recipient: isTokenOutNative ? routerContractTODO : fromAddress,
          amountIn,
          amountOutMinimum: amountOut,
          sqrtPriceLimitX96: 0,
        },
      ]),
    );

    if (isTokenOutNative) {
      // Unwrap the output token if the user specified a native token as the output
      calldatas.push(paymentsContract.encodeFunctionData('unwrapWETH9(uint256)', [amountOut]));
    }

    return calldatas;
  }

  calldatas.push(
    routerContract.encodeFunctionData('exactOutputSingle', [
      {
        tokenIn: route.tokenPath[0].address,
        tokenOut: route.tokenPath[1].address,
        fee: route.pools[0].fee,
        recipient: isTokenOutNative ? routerContractTODO : fromAddress,
        amountInMaximum: amountIn,
        amountOut,
        sqrtPriceLimitX96: 0,
      },
    ]),
  );

  if (isTokenInNative) {
    // Refund ETH if the input token is native and the swap is exact output
    calldatas.push(paymentsContract.encodeFunctionData('refundETH'));
  }

  if (isTokenOutNative) {
    // Unwrap the output token if the user specified a native token as the output
    calldatas.push(paymentsContract.encodeFunctionData('unwrapWETH9(uint256)', [amountOut]));
  }

  return calldatas;
}

function buildSinglePoolSwapWithFees(
  fromAddress: string,
  trade: Trade<Uniswap.Token, Uniswap.Token, Uniswap.TradeType>,
  route: Route<Uniswap.Token, Uniswap.Token>,
  amountIn: string,
  amountOut: string,
  secondaryFees: SecondaryFee[],
  secondaryFeeContract: SecondaryFeeInterface,
) {
  const secondaryFeeValues: ISecondaryFee.SecondaryFeeParamsStruct[] = secondaryFees.map((fee) => ({
    feeBasisPoints: fee.basisPoints,
    recipient: fee.recipient,
  }));

  const calldatas: string[] = [];

  if (trade.tradeType === Uniswap.TradeType.EXACT_INPUT) {
    calldatas.push(
      secondaryFeeContract.encodeFunctionData('exactInputSingleWithSecondaryFee', [
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
      ]),
    );

    return calldatas;
  }

  calldatas.push(
    secondaryFeeContract.encodeFunctionData('exactOutputSingleWithSecondaryFee', [
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
    ]),
  );

  // TODO: Add refundETH method when support is added in SecondaryFee contract

  return calldatas;
}

function buildMultiPoolSwap(
  tokenIn: Coin,
  tokenOut: Coin,
  fromAddress: string,
  trade: Trade<Uniswap.Token, Uniswap.Token, Uniswap.TradeType>,
  route: Route<Uniswap.Token, Uniswap.Token>,
  amountIn: string,
  amountOut: string,
  routerContract: Interface,
  paymentsContract: Interface,
) {
  const path: string = encodeRouteToPath(route, trade.tradeType === Uniswap.TradeType.EXACT_OUTPUT);
  const calldatas: string[] = [];

  if (trade.tradeType === Uniswap.TradeType.EXACT_INPUT) {
    calldatas.push(
      routerContract.encodeFunctionData('exactInput', [
        {
          path,
          recipient: fromAddress,
          amountIn,
          amountOutMinimum: amountOut,
        },
      ]),
    );

    if (tokenOut.type === 'native') {
      // Unwrap the output token if the user specified a native token as the output
      calldatas.push(paymentsContract.encodeFunctionData('unwrapWETH9(uint256)', [amountOut]));
    }

    return calldatas;
  }

  calldatas.push(
    routerContract.encodeFunctionData('exactOutput', [
      {
        path,
        recipient: fromAddress,
        amountInMaximum: amountIn,
        amountOut,
      },
    ]),
  );

  if (tokenIn.type === 'native') {
    // Refund ETH if the input token is native and the swap is exact output
    calldatas.push(paymentsContract.encodeFunctionData('refundETH'));
  }

  if (tokenOut.type === 'native') {
    // Unwrap the output token if the user specified a native token as the output
    calldatas.push(paymentsContract.encodeFunctionData('unwrapWETH9(uint256)', [amountOut]));
  }

  return calldatas;
}

function buildMultiPoolSwapWithFees(
  fromAddress: string,
  trade: Trade<Uniswap.Token, Uniswap.Token, Uniswap.TradeType>,
  route: Route<Uniswap.Token, Uniswap.Token>,
  amountIn: string,
  amountOut: string,
  secondaryFees: SecondaryFee[],
  secondaryFeeContract: SecondaryFeeInterface,
) {
  const path: string = encodeRouteToPath(route, trade.tradeType === Uniswap.TradeType.EXACT_OUTPUT);

  const secondaryFeeValues: ISecondaryFee.SecondaryFeeParamsStruct[] = secondaryFees.map((fee) => ({
    feeBasisPoints: fee.basisPoints,
    recipient: fee.recipient,
  }));

  const calldatas: string[] = [];

  if (trade.tradeType === Uniswap.TradeType.EXACT_INPUT) {
    calldatas.push(
      secondaryFeeContract.encodeFunctionData('exactInputWithSecondaryFee', [
        secondaryFeeValues,
        {
          path,
          recipient: fromAddress,
          amountIn,
          amountOutMinimum: amountOut,
        },
      ]),
    );

    return calldatas;
  }

  calldatas.push(
    secondaryFeeContract.encodeFunctionData('exactOutputWithSecondaryFee', [
      secondaryFeeValues,
      {
        path,
        recipient: fromAddress,
        amountInMaximum: amountIn,
        amountOut,
      },
    ]),
  );

  // TODO: Add refundETH method when support is added in SecondaryFee contract

  return calldatas;
}

/**
 * Builds and array of calldatas for the swap to be executed in the multicall method
 * @param tokenIn The token to be swapped
 * @param tokenOut The token to be received
 * @param fromAddress The address of the user
 * @param trade The trade to be executed
 * @param secondaryFees Secondary fees to be applied to the swap
 * @param secondaryFeeContract The SecondaryFee contract interface
 * @param routerContract The SwapRouter02 contract interface
 * @param paymentsContract The PaymentsExtended contract interface
 * @param maximumAmountIn The maximum amount of tokenIn to be swapped
 * @param minimumAmountOut The minimum amount of tokenOut to be received
 * @returns calldatas that make up the swap transaction
 */
function buildSwapParameters(
  tokenIn: Coin,
  tokenOut: Coin,
  fromAddress: string,
  trade: Trade<Uniswap.Token, Uniswap.Token, Uniswap.TradeType>,
  secondaryFees: SecondaryFee[],
  secondaryFeeContract: SecondaryFeeInterface,
  routerContract: Interface,
  paymentsContract: Interface,
  maximumAmountIn: string,
  minimumAmountOut: string,
) {
  // @dev we don't support multiple swaps in a single transaction
  // there will always be only one swap in the trade regardless of the trade type
  const { route } = trade.swaps[0];

  const isSinglePoolSwap = route.pools.length === 1;
  const hasSecondaryFees = secondaryFees.length > 0;

  if (isSinglePoolSwap) {
    if (hasSecondaryFees) {
      return buildSinglePoolSwapWithFees(
        fromAddress,
        trade,
        route,
        maximumAmountIn,
        minimumAmountOut,
        secondaryFees,
        secondaryFeeContract,
      );
    }

    return buildSinglePoolSwap(
      tokenIn,
      tokenOut,
      fromAddress,
      trade,
      route,
      maximumAmountIn,
      minimumAmountOut,
      routerContract,
      paymentsContract,
    );
  }

  if (hasSecondaryFees) {
    return buildMultiPoolSwapWithFees(
      fromAddress,
      trade,
      route,
      maximumAmountIn,
      minimumAmountOut,
      secondaryFees,
      secondaryFeeContract,
    );
  }

  return buildMultiPoolSwap(
    tokenIn,
    tokenOut,
    fromAddress,
    trade,
    route,
    maximumAmountIn,
    minimumAmountOut,
    routerContract,
    paymentsContract,
  );
}

function createSwapCallParameters(
  tokenIn: Coin,
  tokenOut: Coin,
  trade: Trade<Uniswap.Token, Uniswap.Token, Uniswap.TradeType>,
  fromAddress: string,
  swapOptions: SwapOptions,
  secondaryFees: SecondaryFee[],
  maximumAmountIn: string,
  minimumAmountOut: string,
): string {
  const secondaryFeeContract = SecondaryFee__factory.createInterface();
  const routerContract = SwapRouter.INTERFACE;
  const paymentsContract = PaymentsExtended.INTERFACE;

  const calldatas = buildSwapParameters(
    tokenIn,
    tokenOut,
    fromAddress,
    trade,
    secondaryFees,
    secondaryFeeContract,
    routerContract,
    paymentsContract,
    maximumAmountIn,
    minimumAmountOut,
  );

  // Create the multicall transaction using the calldatas generated above
  return secondaryFeeContract.encodeFunctionData(multicallWithDeadlineFunctionSignature, [
    swapOptions.deadlineOrPreviousBlockhash,
    calldatas,
  ]);
}

function createSwapParameters(
  tokenIn: Coin,
  tokenOut: Coin,
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

  // If the trade type is EXACT_INPUT, then the maximum amount-in is the user-specified amount (no slippage applied)
  // For EXACT_OUTPUT, the maximum amount-in is the amount-in with slippage applied
  // https://github.com/Uniswap/v3-sdk/blob/81d66099f07d1ec350767f497ef73222575fe032/src/entities/trade.ts#L456
  const maximumAmountIn = toHex(uncheckedTrade.maximumAmountIn(options.slippageTolerance).quotient);
  const minimumAmountOut = toHex(uncheckedTrade.minimumAmountOut(options.slippageTolerance).quotient);

  return {
    calldata: createSwapCallParameters(
      tokenIn,
      tokenOut,
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
  tokenOut: Coin,
  adjustedQuote: QuoteResult,
  fromAddress: string,
  slippage: number,
  deadline: number,
  routerContractAddress: string,
  secondaryFeesContractAddress: string,
  gasPrice: CoinAmount<Coin> | null,
  secondaryFees: SecondaryFee[],
): TransactionDetails {
  const { calldata, maximumAmountIn } = createSwapParameters(
    tokenIn,
    tokenOut,
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
      to: secondaryFees.length > 0 ? secondaryFeesContractAddress : routerContractAddress,
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
  if (ourQuote.tradeType === Uniswap.TradeType.EXACT_OUTPUT) {
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
