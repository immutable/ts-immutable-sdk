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
import { SecondaryFee__factory } from 'contracts/types';
import { ParamType } from 'ethers/lib/utils';
import {
  SecondaryFee,
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

// A function that replaces the 0x20 data offset in calldata with 0x100 
function replaceDataOffset(calldata: string) {
  var firstPart = calldata.substring(0,63);
  const newOffset = '100'; // 256 in hex
  var secondPart = calldata.substring(66);
  return firstPart + newOffset + secondPart;
}

// Split the encoded array into offset and data part
function splitEncodedArray(encodedArray: string) {
  if (encodedArray.substring(0, 2) === '0x') {
    encodedArray = encodedArray.substring(2);
  }
  const offset = encodedArray.substring(0, 64);
  const data = encodedArray.substring(64);
  console.log("OFFSET" + offset)
  return { offset, data };
}

export function createSwapParametersWithFees(
  trade: QuoteTradeInfo,
  fromAddress: string,
  slippage: number,
  deadline: number,
  serviceFees: SecondaryFee[],
) {
  // TODO: Check the trade type and use the appropriate parameters - Determine the method signature by the
  // TradeType + number of pools in the Route (1 pool = Exact...Single, 2+ pools = Exact...)

  // only when doing single swap vvv
  const OFFSET_OF_SECONDARY_FEE_ARRAY = (256).toString(16); // 256 bytes
  console.log(OFFSET_OF_SECONDARY_FEE_ARRAY)

  // TODO: This is only for ExactInputSingle/ExactOutputSingle at the moment
  const tx = createSwapParameters(trade, fromAddress, slippage, deadline);
  console.log({swapCallData: tx.calldata})
  // Remove the first 100 bytes of the calldata for the swap
  // - 4 bytes for the function selector
  // - 32 bytes for the deadline
  // - 32 bytes for the offset
  // - 32 bytes for the array size
  const data = ethers.utils.hexDataSlice(tx.calldata, 100);

  const decodedTopLevelParams = ethers.utils.defaultAbiCoder.decode(
    ['bytes'],
    data,
  );

  const calldata = decodedTopLevelParams[0];

  // Skip the first 4 bytes of the calldata for the swap and omit the 0x from the string
  const swapParamBytes = ethers.utils.hexDataSlice(calldata, 4).substring(2);

  const secondaryFeeContract = SecondaryFee__factory.createInterface();
  const secondaryFeeValues = serviceFees.map((fee) => [fee.feeRecipient, fee.feeBasisPoints]);
  // eslint-disable-next-line
  const secondaryFeeParamBytes = secondaryFeeContract._encodeParams([ParamType.from('tuple(address,uint16)[]')], [secondaryFeeValues]).substring(2);

  // eslint-disable-next-line
  console.log({ secondaryFeeParamBytes: secondaryFeeParamBytes });
  const secondaryFeeWithCorrectOffset = replaceDataOffset("0x" + secondaryFeeParamBytes);
  const { offset: secondaryFeeOffset, data: secondaryFeeData } = splitEncodedArray(secondaryFeeWithCorrectOffset)
  console.log({ offset: secondaryFeeOffset, data: secondaryFeeData })
  const exactInputSingleWithServiceFeeFunctionSignature = ethers.utils.id('exactInputSingleWithServiceFee((address,uint16)[],(address,address,uint24,address,uint256,uint256,uint160))').substring(0, 10);
  // eslint-disable-next-line
  // const paramsBytes = exactInputSingleWithServiceFeeFunctionSignature + secondaryFeeParamBytes + swapParamBytes;
  const paramsBytes = exactInputSingleWithServiceFeeFunctionSignature + secondaryFeeOffset + swapParamBytes + secondaryFeeData;
  console.log({ paramsBytes });


  // eslint-disable-next-line
  const multicallParamBytes = secondaryFeeContract._encodeParams([ParamType.from('uint256'), ParamType.from('bytes[]')], [deadline, [paramsBytes]]).substring(2);

  const multicallFunctionSignature = ethers.utils.id('multicall(uint256,bytes[])').substring(0, 10);
  const multicallCallData = multicallFunctionSignature + multicallParamBytes;

  console.log({ multicallCallData });

  return {};
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
  const serviceFees: SecondaryFee[] = [{
    feeRecipient: '0x00000008eBA51Df7263AAF729A6eDdB0cAd174d5',
    feeBasisPoints: 1000,
  }];

  // if fees, use createSwapParametersWithFees
  createSwapParametersWithFees(
    routeAndQuote.trade,
    fromAddress,
    slippage,
    deadline,
    serviceFees,
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
