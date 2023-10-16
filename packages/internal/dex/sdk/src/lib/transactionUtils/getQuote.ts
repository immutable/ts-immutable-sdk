/* eslint-disable arrow-body-style */
import * as Uniswap from '@uniswap/sdk-core';
import { ethers } from 'ethers';
import { Fees } from 'lib/fees';
import { QuoteResult } from 'lib/getQuotesForRoutes';
import { Currency, CurrencyAmount, Token } from 'types/amount';
import {
  Quote,
} from '../../types';
import { slippageToFraction } from './slippage';

function getQuoteAmountFromTradeType(tradeInfo: QuoteResult): CurrencyAmount<Token> {
  if (tradeInfo.tradeType === Uniswap.TradeType.EXACT_INPUT) {
    return tradeInfo.amountOut;
  }

  return tradeInfo.amountIn;
}

export function applySlippage(
  tradeType: Uniswap.TradeType,
  amount: ethers.BigNumber,
  slippage: number,
): ethers.BigNumber {
  const slippageTolerance = slippageToFraction(slippage);
  const slippagePlusOne = slippageTolerance.add(1);
  const maybeInverted = tradeType === Uniswap.TradeType.EXACT_INPUT ? slippagePlusOne.invert() : slippagePlusOne;
  const amountWithSlippage = maybeInverted.multiply(amount.toString()).quotient;
  return ethers.BigNumber.from(amountWithSlippage.toString());
}

export function prepareUserQuote(
  otherToken: Currency,
  tradeInfo: QuoteResult,
  slippage: number,
  fees: Fees,
): Quote {
  const quote = getQuoteAmountFromTradeType(tradeInfo);
  const amountWithSlippage = applySlippage(tradeInfo.tradeType, quote.value, slippage);

  return {
    amount: quote,
    amountWithMaxSlippage: new CurrencyAmount(otherToken, amountWithSlippage),
    slippage,
    fees: fees.withAmounts(),
  };
}

export function getOurQuoteReqAmount(
  amount: CurrencyAmount<Currency>,
  fees: Fees,
  tradeType: Uniswap.TradeType,
  wrappedNativeToken: Token,
): CurrencyAmount<Token> {
  if (tradeType === Uniswap.TradeType.EXACT_OUTPUT) {
    // For an exact output swap, we do not need to subtract fees from the given amount
    return amount.wrap(wrappedNativeToken);
  }

  fees.addAmount(amount);

  return fees.amountLessFees().wrap(wrappedNativeToken);
}
