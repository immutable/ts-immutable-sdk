import { TradeType } from '@uniswap/sdk-core';
import { ethers } from 'ethers';
import { Fees } from 'lib/fees';
import { QuoteResult } from 'lib/getQuotesForRoutes';
import { NativeTokenService } from 'lib/nativeTokenService';
import { isERC20Amount } from 'lib/utils';
import {
  Amount, Coin, ERC20, Quote,
} from '../../types';
import { slippageToFraction } from './slippage';

function getQuoteAmountFromTradeType(tradeInfo: QuoteResult): Amount<ERC20> {
  if (tradeInfo.tradeType === TradeType.EXACT_INPUT) {
    return tradeInfo.amountOut;
  }

  return tradeInfo.amountIn;
}

export function applySlippage(
  tradeType: TradeType,
  amount: ethers.BigNumber,
  slippage: number,
): ethers.BigNumber {
  const slippageTolerance = slippageToFraction(slippage);
  const slippagePlusOne = slippageTolerance.add(1);
  const maybeInverted = tradeType === TradeType.EXACT_INPUT ? slippagePlusOne.invert() : slippagePlusOne;
  const amountWithSlippage = maybeInverted.multiply(amount.toString()).quotient;
  return ethers.BigNumber.from(amountWithSlippage.toString());
}

export function prepareUserQuote(
  otherToken: ERC20,
  tradeInfo: QuoteResult,
  slippage: number,
  fees: Fees,
): Quote {
  const quote = getQuoteAmountFromTradeType(tradeInfo);
  const amountWithSlippage = applySlippage(tradeInfo.tradeType, quote.value, slippage);

  return {
    amount: quote,
    amountWithMaxSlippage: {
      token: otherToken,
      value: amountWithSlippage,
    },
    slippage,
    fees: fees.withAmounts(),
  };
}

export function getOurQuoteReqAmount(
  amountSpecified: Amount<Coin>, // the amount specified by the user, either exactIn or exactOut
  fees: Fees,
  tradeType: TradeType,
  nativeTokenService: NativeTokenService,
): Amount<ERC20> {
  // TODO: TP-1649: Remove this when we support Native
  if (!isERC20Amount(amountSpecified)) {
    throw new Error('Not implemented yet!');
  }

  if (tradeType === TradeType.EXACT_OUTPUT) {
    // For an exact output swap, we do not need to subtract fees from the given amount
    return nativeTokenService.maybeWrapAmount(amountSpecified);
  }

  fees.addAmount(amountSpecified);

  return nativeTokenService.maybeWrapAmount(fees.amountLessFees());
}
