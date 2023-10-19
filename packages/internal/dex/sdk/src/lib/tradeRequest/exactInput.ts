import { TradeType } from '@uniswap/sdk-core';
import { QuoteResult } from 'lib/getQuotesForRoutes';
import { NativeTokenService } from 'lib/nativeTokenService';
import { Quote } from 'lib/quote/base';
import { ExactInputQuote } from 'lib/quote/exactInput';
import { newAmount, subtractERC20Amount } from 'lib/utils';
import { CoinAmount, ERC20, SecondaryFee } from 'types';
import { BASIS_POINT_PRECISION } from '../../constants';
import { TradeRequest } from './base';

export class ExactInput extends TradeRequest {
  constructor(
    readonly amountIn: CoinAmount<ERC20>,
    readonly tokenOut: ERC20,
    secondaryFees: SecondaryFee[],
    slippagePercentage: number,
    maxHops: number,
    nativeTokenService: NativeTokenService,
  ) {
    super(secondaryFees, slippagePercentage, maxHops, TradeType.EXACT_INPUT, nativeTokenService);
    this.amountIn = amountIn;
    this.tokenOut = tokenOut;
  }

  getBestQuote(quotes: QuoteResult[]): Quote {
    let bestQuote = quotes[0];

    for (let i = 1; i < quotes.length; i++) {
      if (quotes[i].amount.value.gt(bestQuote.amount.value)) {
        bestQuote = quotes[i];
      }
    }

    return new ExactInputQuote(this, bestQuote, this.nativeTokenService);
  }

  private get amountLessFees() {
    let amount = this.amountIn;

    for (const fee of this.secondaryFees) {
      const feeAmount = this.amountIn.value.mul(fee.basisPoints).div(BASIS_POINT_PRECISION);
      amount = subtractERC20Amount(amount, newAmount(feeAmount, this.amountIn.token));
    }

    return amount;
  }

  get tokenIn() {
    return this.amountIn.token;
  }

  get ourQuoteReqAmount() {
    return this.nativeTokenService.maybeWrapAmount(this.amountLessFees);
  }

  get otherToken() {
    return this.tokenOut;
  }

  get specifiedAmount() {
    return this.amountIn;
  }
}
