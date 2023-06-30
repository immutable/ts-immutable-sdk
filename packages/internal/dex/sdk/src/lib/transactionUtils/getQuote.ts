import {
  Currency, Token, TradeType,
} from '@uniswap/sdk-core';
import { ethers } from 'ethers';
import { QuoteTradeInfo } from 'lib/router';
import {
  Amount, Quote, TokenInfo,
} from '../../types';
import { slippageToFraction } from './slippage';

function getQuoteAmountFromTradeType(tradeType: TradeType, tradeInfo: QuoteTradeInfo, tokenInfo: TokenInfo): Amount {
  if (tradeType === TradeType.EXACT_INPUT) {
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

export function getAmountWithSlippageImpact(
  tradeType: TradeType,
  amount: ethers.BigNumberish,
  slippage: number,
): ethers.BigNumberish {
  const slippagePercent = slippageToFraction(slippage);
  if (slippagePercent.numerator.toString() === '0') {
    return amount;
  }

  const amountBigNumber = ethers.BigNumber.from(amount);
  const slippageImpact = amountBigNumber
    .mul(slippagePercent.numerator.toString())
    .div(slippagePercent.denominator.toString());

  return tradeType === TradeType.EXACT_INPUT
    ? amountBigNumber.sub(slippageImpact)
    : amountBigNumber.add(slippageImpact);
}

export function getQuote(
  otherCurrency: Currency,
  tradeType: TradeType,
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

  const quote = getQuoteAmountFromTradeType(tradeType, tradeInfo, tokenInfo);

  const amountWithSlippageImpact = getAmountWithSlippageImpact(
    tradeType,
    quote.value,
    slippage,
  );

  const quoteWithMaxSlippage = {
    token: tokenInfo,
    value: amountWithSlippageImpact,
  };

  return {
    amount: quote,
    amountWithMaxSlippage: quoteWithMaxSlippage,
    slippage,
  };
}
