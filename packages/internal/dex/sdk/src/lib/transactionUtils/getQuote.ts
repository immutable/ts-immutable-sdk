import { TradeType } from '@uniswap/sdk-core';
import { ethers } from 'ethers';
import { Fees } from 'lib/fees';
import { QuoteResult } from 'lib/getQuotesForRoutes';
import { NativeTokenService } from 'lib/nativeTokenService';
import { Amount, Coin, ERC20 } from 'types/private';
import { slippageToFraction } from './slippage';

export function getQuoteAmountFromTradeType(tradeInfo: QuoteResult): Amount<ERC20> {
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

export function getOurQuoteReqAmount(
  amountSpecified: Amount<Coin>, // the amount specified by the user, either exactIn or exactOut
  fees: Fees,
  tradeType: TradeType,
  nativeTokenService: NativeTokenService,
): Amount<ERC20> {
  if (tradeType === TradeType.EXACT_OUTPUT) {
    // For an exact output swap, we do not need to subtract fees from the given amount
    return nativeTokenService.maybeWrapAmount(amountSpecified);
  }

  fees.addAmount(amountSpecified);

  return nativeTokenService.maybeWrapAmount(fees.amountLessFees());
}
