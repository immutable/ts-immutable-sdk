import {
  Currency, Token, TradeType,
} from '@uniswap/sdk-core';
import { ethers } from 'ethers';
import { QuoteTradeInfo } from 'lib/router';
import {
  Amount, Quote, TokenInfo,
} from '../../types';
import { slippageToFraction } from './slippage';

function getQuoteAmountFromTradeType(tradeInfo: QuoteTradeInfo, tokenInfo: TokenInfo): Amount {
  if (tradeInfo.tradeType === TradeType.EXACT_INPUT) {
    return {
      token: tokenInfo,
      value: tradeInfo.amountOut,
    };
  }

  return {
    token: tokenInfo,
    value: tradeInfo.amountIn,
  };
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
  otherCurrency: Currency,
  tradeInfo: QuoteTradeInfo,
  slippage: number,
): Quote {
  const resultToken: Token = otherCurrency.wrapped;
  const tokenInfo: TokenInfo = {
    chainId: resultToken.chainId,
    address: resultToken.address,
    decimals: resultToken.decimals,
    symbol: resultToken.symbol,
    name: resultToken.name,
  };

  const quote = getQuoteAmountFromTradeType(tradeInfo, tokenInfo);
  const amountWithSlippage = applySlippage(tradeInfo.tradeType, quote.value, slippage);

  return {
    amount: quote,
    amountWithMaxSlippage: {
      token: tokenInfo,
      value: amountWithSlippage,
    },
    slippage,
  };
}
