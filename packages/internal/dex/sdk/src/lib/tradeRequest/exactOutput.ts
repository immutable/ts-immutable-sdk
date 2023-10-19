/* eslint-disable class-methods-use-this */
import { TradeType } from '@uniswap/sdk-core';
import { ethers } from 'ethers';
import { QuoteResult } from 'lib/getQuotesForRoutes';
import { NativeTokenService } from 'lib/nativeTokenService';
import { Quote } from 'lib/quote/base';
import { ExactOutputQuote } from 'lib/quote/exactOutput';
import { newAmount } from 'lib/utils';
import { CoinAmount, ERC20, SecondaryFee } from 'types';
import { TradeRequest } from './base';

export class ExactOutput extends TradeRequest {
  constructor(
    readonly amountOut: CoinAmount<ERC20>,
    readonly tokenIn: ERC20,
    secondaryFees: SecondaryFee[],
    slippagePercentage: number,
    maxHops: number,
    nativeTokenService: NativeTokenService,
  ) {
    super(secondaryFees, slippagePercentage, maxHops, nativeTokenService);
    this.amountOut = amountOut;
    this.tokenIn = tokenIn;
  }

  buildQuoteAmountIn(value: ethers.BigNumber, token: ERC20): CoinAmount<ERC20> {
    return newAmount(value, token);
  }

  buildQuoteAmountOut(): CoinAmount<ERC20> {
    return this.specifiedAmount;
  }

  addBestQuote(quotes: QuoteResult[]): Quote {
    let bestQuote = quotes[0];

    for (let i = 1; i < quotes.length; i++) {
      if (quotes[i].amountIn.value.gt(bestQuote.amountIn.value)) {
        bestQuote = quotes[i];
      }
    }

    return new ExactOutputQuote(this, bestQuote, this.nativeTokenService);
  }

  get tokenOut() {
    return this.amountOut.token;
  }

  get ourQuoteReqAmount() {
    return this.nativeTokenService.maybeWrapAmount(this.amountOut);
  }

  get otherToken() {
    return this.tokenIn;
  }

  get specifiedAmount() {
    return this.amountOut;
  }

  get tradeType() {
    return TradeType.EXACT_OUTPUT;
  }
}
