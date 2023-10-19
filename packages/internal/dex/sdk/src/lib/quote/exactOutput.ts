import { BigNumber } from 'ethers';
import { QuoteResult } from 'lib/getQuotesForRoutes';
import { NativeTokenService } from 'lib/nativeTokenService';
import { ExactOutput } from 'lib/tradeRequest/exactOutput';
import { slippageToFraction } from 'lib/transactionUtils/slippage';
import { addAmount, newAmount } from 'lib/utils';
import { Quote } from './base';

export class ExactOutputQuote extends Quote {
  tradeRequest: ExactOutput;

  constructor(tradeRequest: ExactOutput, quoteResult: QuoteResult, nativeTokenService: NativeTokenService) {
    super(quoteResult, nativeTokenService);
    this.tradeRequest = tradeRequest;
  }

  get amountOut() {
    return this.tradeRequest.amountOut;
  }

  get quotedAmount() {
    return addAmount(this.quoteResult.amount, this.totalFees);
  }

  get amountInForApproval() {
    if (this.nativeTokenService.isNativeToken(this.quotedAmountWithMaxSlippage.token)) {
      return newAmount(BigNumber.from(0), this.tokenIn);
    }
    return this.quotedAmountWithMaxSlippage;
  }

  get amountInForSwap() {
    const amountWithFeesApplied = addAmount(this.amountInSubjectToFees, this.totalFees);
    return this.nativeTokenService.maybeWrapAmount(amountWithFeesApplied);
  }

  get amountInSubjectToFees() {
    return this.nativeTokenService.isNativeToken(this.tokenIn)
      ? this.nativeTokenService.unwrapAmount(this.quoteResult.amount)
      : this.quoteResult.amount;
  }

  get slippageMultiplier() {
    return slippageToFraction(this.slippagePercentage).add(1);
  }
}
