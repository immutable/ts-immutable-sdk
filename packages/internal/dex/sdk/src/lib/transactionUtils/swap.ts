import {
  MethodParameters, Trade, toHex, encodeRouteToPath,
} from '@uniswap/v3-sdk';
import { SwapOptions, SwapRouter } from '@uniswap/router-sdk';
import {
  Currency,
  CurrencyAmount,
  TradeType,
} from '@uniswap/sdk-core';
import JSBI from 'jsbi';
import { ethers } from 'ethers';
import { QuoteResponse, QuoteTradeInfo } from 'lib/router';
import { SecondaryFee__factory } from 'contracts/types';
import { ParamType } from 'ethers/lib/utils';
import {
  SecondaryFee,
  TokenInfo, TransactionDetails,
} from '../../types';
import { calculateGasFee } from './gas';
import { slippageToFraction } from './slippage';

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

  return createSwapParametersWithFees(uncheckedTrade, fromAddress, options, secondaryFees);
}

// A function that replaces the 0x20 data offset in calldata with 0x100
function replaceDataOffset(calldata: string) {
  const firstPart = calldata.substring(0, 63);
  const newOffset = '100'; // 256 in hex
  const secondPart = calldata.substring(66);
  return firstPart + newOffset + secondPart;
}

// Split the encoded array into offset and data part
function splitEncodedArray(encodedArray: string) {
  if (encodedArray.substring(0, 2) === '0x') {
    encodedArray = encodedArray.substring(2);
  }
  const offset = encodedArray.substring(0, 64);
  const data = encodedArray.substring(64);
  console.log(`OFFSET${offset}`);
  return { offset, data };
}

export function createSwapParametersWithFees(
  trade: Trade<Currency, Currency, TradeType>,
  fromAddress: string,
  swapOptions: SwapOptions,
  secondaryFees: SecondaryFee[],
): string {
  const swapCalldata = encodeSwap(
    fromAddress,
    '0x8dBE1f0900C5e92ad87A54521902a33ba1598C51',
    trade,
    swapOptions,
  );

  console.log({ swapCalldata: swapCalldata[0] });

  // only when doing single swap vvv
  const OFFSET_OF_SECONDARY_FEE_ARRAY = (256).toString(16); // 256 bytes
  console.log(OFFSET_OF_SECONDARY_FEE_ARRAY);

  // Skip the first 4 bytes of the calldata for the swap and omit the 0x from the string
  const swapParamBytes = ethers.utils.hexDataSlice(swapCalldata[0], 4).substring(2);

  const secondaryFeeContract = SecondaryFee__factory.createInterface();
  const secondaryFeeValues = secondaryFees.map((fee) => [fee.feeRecipient, fee.feeBasisPoints]);
  // eslint-disable-next-line
  const secondaryFeeParamBytes = secondaryFeeContract._encodeParams([ParamType.from('tuple(address,uint16)[]')], [secondaryFeeValues]).substring(2);

  // eslint-disable-next-line
  console.log({ secondaryFeeParamBytes: secondaryFeeParamBytes });
  const secondaryFeeWithCorrectOffset = replaceDataOffset(`0x${secondaryFeeParamBytes}`);
  const { offset: secondaryFeeOffset, data: secondaryFeeData } = splitEncodedArray(secondaryFeeWithCorrectOffset);
  console.log({ offset: secondaryFeeOffset, data: secondaryFeeData });
  // eslint-disable-next-line
  const exactInputSingleWithServiceFeeFunctionSignature = ethers.utils.id('exactInputSingleWithServiceFee((address,uint16)[],(address,address,uint24,address,uint256,uint256,uint160))').substring(0, 10);
  // const paramsBytes = exactInputSingleWithServiceFeeFunctionSignature + secondaryFeeParamBytes + swapParamBytes;
  // eslint-disable-next-line
  const paramsBytes = exactInputSingleWithServiceFeeFunctionSignature + secondaryFeeOffset + swapParamBytes + secondaryFeeData;
  console.log({ paramsBytes });

  // eslint-disable-next-line
  const multicallParamBytes = secondaryFeeContract._encodeParams([ParamType.from('uint256'), ParamType.from('bytes[]')], [swapOptions.deadlineOrPreviousBlockhash, [paramsBytes]]).substring(2);

  const multicallFunctionSignature = ethers.utils.id('multicall(uint256,bytes[])').substring(0, 10);
  const multicallCallData = multicallFunctionSignature + multicallParamBytes;

  console.log({ multicallCallData });

  return multicallCallData;
}

export function getSwap(
  nativeToken: TokenInfo,
  routeAndQuote: QuoteResponse,
  fromAddress: string,
  slippage: number,
  deadline: number,
  peripheryRouterAddress: string,
  gasPrice: ethers.BigNumber | null,
  secondaryFees: SecondaryFee[],
  // add fees
): TransactionDetails {
  // TODO: pass fees from config
  secondaryFees = [{
    feeRecipient: '0xa6C368164Eb270C31592c1830Ed25c2bf5D34BAE',
    feeBasisPoints: 1000,
  }];

  const calldata = createSwapParameters(
    routeAndQuote.trade,
    fromAddress,
    slippage,
    deadline,
    secondaryFees,
  );

  const gasFeeEstimate = gasPrice ? {
    token: nativeToken,
    value: calculateGasFee(gasPrice, routeAndQuote.trade.gasEstimate),
  } : null;

  return {
    transaction: {
      data: calldata,
      to: peripheryRouterAddress,
      value: 0, // we should never send the native currency to the router in addition to the swap
      from: fromAddress,
    },
    gasFeeEstimate,
  };
}

/**
 *
 * @param fromAddress the msg.sender of the transaction
 * @param secondaryFeeAddress the secondary fee contract address
 * @param trade details of the swap, including the route, input/output tokens and amounts
 * @param options additional swap options
 * @returns string[] of calldata for the swap
 */
function encodeSwap(
  fromAddress: string,
  secondaryFeeAddress: string,
  trade: Trade<Currency, Currency, TradeType>,
  options: SwapOptions,
): string {
  // We don't support multiple swaps in a single transaction
  const { route, inputAmount, outputAmount } = trade.swaps[0];
  const amountIn: string = toHex(trade.maximumAmountIn(options.slippageTolerance, inputAmount).quotient);
  const amountOut: string = toHex(trade.minimumAmountOut(options.slippageTolerance, outputAmount).quotient);

  // flag for whether the trade is a single hop or not
  const singleHop = route.pools.length === 1;

  if (singleHop) {
    if (trade.tradeType === TradeType.EXACT_INPUT) {
      const exactInputSingleParams = {
        tokenIn: route.tokenPath[0].address,
        tokenOut: route.tokenPath[1].address,
        fee: route.pools[0].fee,
        recipient: fromAddress,
        amountIn,
        amountOutMinimum: amountOut, // always apply slippage tolerance
        sqrtPriceLimitX96: 0,
      };

      return SwapRouter.INTERFACE.encodeFunctionData('exactInputSingle', [exactInputSingleParams]);
    }
    const exactOutputSingleParams = {
      tokenIn: route.tokenPath[0].address,
      tokenOut: route.tokenPath[1].address,
      fee: route.pools[0].fee,
      recipient: secondaryFeeAddress, // The secondary fee contract must custody tokens for an exact output swap
      amountOut,
      amountInMaximum: amountIn, // always apply slippage tolerance
      sqrtPriceLimitX96: 0,
    };

    return SwapRouter.INTERFACE.encodeFunctionData('exactOutputSingle', [exactOutputSingleParams]);
  }

  const path: string = encodeRouteToPath(route, trade.tradeType === TradeType.EXACT_OUTPUT);

  if (trade.tradeType === TradeType.EXACT_INPUT) {
    const exactInputParams = {
      path,
      recipient: fromAddress,
      amountIn,
      amountOutMinimum: amountOut, // always apply slippage tolerance
    };

    return SwapRouter.INTERFACE.encodeFunctionData('exactInput', [exactInputParams]);
  }
  const exactOutputParams = {
    path,
    secondaryFeeAddress, // The secondary fee contract must custody tokens for an exact output swap
    recipient: amountOut,
    amountInMaximum: amountIn, // always apply slippage tolerance
  };

  return SwapRouter.INTERFACE.encodeFunctionData('exactOutput', [exactOutputParams]);
}
