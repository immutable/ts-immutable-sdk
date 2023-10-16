/* eslint-disable max-len */
import { TradeType } from '@uniswap/sdk-core';
import { ethers } from 'ethers';
import { Fees } from 'lib/fees';
import { QuoteResult } from 'lib/getQuotesForRoutes';
import { isNative, maybeWrapAmount, newAmount } from 'lib/utils';
import {
  Currency,
  ERC20, Native, Quote, TokenAmount,
} from '../../types';
import { slippageToFraction } from './slippage';

function getQuoteAmountFromTradeType(tradeInfo: QuoteResult): TokenAmount<ERC20> {
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

const unwrapAmount = (amount: TokenAmount<ERC20>, nativeToken: Native): TokenAmount<Native> => newAmount(amount.value, nativeToken);

export function prepareUserQuote<T extends Native | ERC20>(
  tokenOfQuotedAmount: T,
  tradeInfo: QuoteResult,
  slippage: number,
  fees: Fees,
  nativeToken: Native,
): Quote {
  const erc20QuoteAmount = getQuoteAmountFromTradeType(tradeInfo);

  const maybeUnwrappedQuoteAmount = isNative(tokenOfQuotedAmount) ? unwrapAmount(erc20QuoteAmount, nativeToken) : erc20QuoteAmount;

  const amountWithSlippage = applySlippage(tradeInfo.tradeType, maybeUnwrappedQuoteAmount.value, slippage);

  return {
    amount: maybeUnwrappedQuoteAmount as TokenAmount<T>, // TODO: Make it better?
    amountWithMaxSlippage: {
      token: tokenOfQuotedAmount,
      value: amountWithSlippage,
    },
    slippage,
    fees: fees.withAmounts(),
  };
}

export function getOurQuoteReqAmount(
  amountSpecified: TokenAmount<Currency>, // the amount specified by the user, either exactIn or exactOut
  fees: Fees,
  tradeType: TradeType,
  wrappedNativeToken: ERC20,
): TokenAmount<ERC20> {
  if (tradeType === TradeType.EXACT_OUTPUT) {
    // For an exact output swap, we do not need to subtract fees from the given amount
    return maybeWrapAmount(amountSpecified, wrappedNativeToken);
  }

  fees.addAmount(amountSpecified);

  return maybeWrapAmount(fees.amountLessFees(), wrappedNativeToken);
}
