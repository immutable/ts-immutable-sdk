import { BigNumber } from 'ethers';
import { QuoteResult } from 'lib/getQuotesForRoutes';
import { NativeTokenService } from 'lib/nativeTokenService';
import { ExactInput } from 'lib/tradeRequest/exactInput';
import { slippageToFraction } from 'lib/transactionUtils/slippage';
import { newAmount } from 'lib/utils';
import { Quote } from './base';

export class ExactInputQuote extends Quote {
  tradeRequest: ExactInput;

  constructor(tradeRequest: ExactInput, quoteResult: QuoteResult, nativeTokenService: NativeTokenService) {
    super(quoteResult, nativeTokenService);
    this.tradeRequest = tradeRequest;
  }

  get amountInForSwap() {
    return this.nativeTokenService.maybeWrapAmount(this.tradeRequest.amountIn);
  }

  get amountOut() {
    return this.quoteResult.amount;
  }

  // Fees were already taken before the quote, so nothing further to do here.
  get quotedAmount() {
    return this.quoteResult.amount;
  }

  get amountInForApproval() {
    if (this.nativeTokenService.isNativeToken(this.tokenIn)) {
      return newAmount(BigNumber.from(0), this.tokenIn);
    }
    return this.tradeRequest.amountIn;
  }

  get amountInSubjectToFees() {
    return this.tradeRequest.amountIn;
  }

  get slippageMultiplier() {
    return slippageToFraction(this.slippagePercentage).add(1).invert();
  }
}
