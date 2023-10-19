import { TradeType } from '@uniswap/sdk-core';
import { QuoteResult } from 'lib/getQuotesForRoutes';
import { NativeTokenService } from 'lib/nativeTokenService';
import { Quote } from 'lib/quote/base';
import { ExactOutputQuote } from 'lib/quote/exactOutput';
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
    super(secondaryFees, slippagePercentage, maxHops, TradeType.EXACT_OUTPUT, nativeTokenService);
    this.amountOut = amountOut;
    this.tokenIn = tokenIn;
  }

  getBestQuote(quotes: QuoteResult[]): Quote {
    let bestQuote = quotes[0];

    for (let i = 1; i < quotes.length; i++) {
      if (quotes[i].amount.value.gt(bestQuote.amount.value)) {
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
}
