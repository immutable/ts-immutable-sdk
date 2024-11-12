import { TradeType } from '@uniswap/sdk-core';
import { Fees } from '../fees';
import { QuoteResult } from '../getQuotesForRoutes';
import { NativeTokenService, canUnwrapToken } from '../nativeTokenService';
import { newAmount } from '../utils';
import { Coin, CoinAmount, ERC20 } from '../../types';
import { slippageToFraction } from './slippage';

export function getQuoteAmountFromTradeType(routerQuote: QuoteResult): CoinAmount<ERC20> {
  if (routerQuote.tradeType === TradeType.EXACT_INPUT) {
    return routerQuote.amountOut;
  }

  return routerQuote.amountIn;
}

export function applySlippage(tradeType: TradeType, amount: bigint, slippage: number): bigint {
  const slippageTolerance = slippageToFraction(slippage);
  const slippagePlusOne = slippageTolerance.add(1);
  const maybeInverted = tradeType === TradeType.EXACT_INPUT ? slippagePlusOne.invert() : slippagePlusOne;
  const amountWithSlippage = maybeInverted.multiply(amount.toString()).quotient;
  return BigInt(amountWithSlippage.toString());
}

export const prepareUserQuote = (
  nativeTokenService: NativeTokenService,
  routerQuote: QuoteResult,
  slippage: number,
  tokenOfQuotedAmount: Coin,
) => {
  const erc20QuoteAmount = getQuoteAmountFromTradeType(routerQuote);

  // If the quote amount is the native token, we need to unwrap it if the user originally specified the native token
  const quotedAmount = canUnwrapToken(tokenOfQuotedAmount)
    ? nativeTokenService.unwrapAmount(erc20QuoteAmount)
    : erc20QuoteAmount;

  const quotedAmountWithMaxSlippage = newAmount(
    applySlippage(routerQuote.tradeType, quotedAmount.value, slippage),
    tokenOfQuotedAmount,
  );

  return {
    quotedAmount,
    quotedAmountWithMaxSlippage,
  };
};

export function getOurQuoteReqAmount(
  amountSpecified: CoinAmount<Coin>, // the amount specified by the user, either exactIn or exactOut
  fees: Fees,
  tradeType: TradeType,
  nativeTokenService: NativeTokenService,
): CoinAmount<ERC20> {
  if (tradeType === TradeType.EXACT_OUTPUT) {
    // For an exact output swap, we do not need to subtract fees from the given amount
    return nativeTokenService.maybeWrapAmount(amountSpecified);
  }

  fees.addAmount(amountSpecified);

  return nativeTokenService.maybeWrapAmount(fees.amountLessFees());
}
