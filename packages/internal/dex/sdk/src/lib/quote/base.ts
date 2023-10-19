/* eslint-disable @typescript-eslint/lines-between-class-members */
import { Fraction } from '@uniswap/sdk-core';
import { BigNumber, ethers } from 'ethers';
import { QuoteResult } from 'lib/getQuotesForRoutes';
import { NativeTokenService } from 'lib/nativeTokenService';
import { TradeRequest } from 'lib/tradeRequest/base';
import { addAmount, newAmount } from 'lib/utils';
import { CoinAmount, ERC20, Coin } from 'types';
import { BASIS_POINT_PRECISION } from '../../constants';

export abstract class Quote {
  quoteResult: QuoteResult;
  nativeTokenService: NativeTokenService;

  abstract tradeRequest: TradeRequest;
  abstract amountInForSwap: CoinAmount<ERC20>;
  abstract amountOut: CoinAmount<ERC20>;

  // Amount that should be quoted to the user without slippage but including fees
  abstract quotedAmount: CoinAmount<Coin>;

  // Amount that should be used as the base amount to calculate fees
  abstract amountInSubjectToFees: CoinAmount<Coin>;
  abstract slippageMultiplier: Fraction;
  abstract amountInForApproval: CoinAmount<ERC20>;

  constructor(quoteResult: QuoteResult, nativeTokenService: NativeTokenService) {
    this.quoteResult = quoteResult;
    this.nativeTokenService = nativeTokenService;
  }

  get secondaryFees() {
    return this.tradeRequest.secondaryFees.map((fee) => {
      const feeAmount = this.amountInSubjectToFees.value.mul(fee.basisPoints).div(BASIS_POINT_PRECISION);

      return {
        ...fee,
        amount: newAmount(feeAmount, this.amountInSubjectToFees.token),
      };
    });
  }

  get totalFees() {
    return this.secondaryFees.reduce(
      (total, fee) => addAmount(total, fee.amount),
      newAmount(BigNumber.from(0), this.amountInSubjectToFees.token),
    );
  }

  // slippage is always on the quoted amount
  get amountWithMaxSlippage(): CoinAmount<ERC20> {
    const amountWithSlippage = this.slippageMultiplier.multiply(this.quotedAmount.value.toString()).quotient;
    return newAmount(ethers.BigNumber.from(amountWithSlippage.toString()), this.tradeRequest.otherToken);
  }

  get route() {
    return this.quoteResult.route;
  }

  get tradeType() {
    return this.tradeRequest.tradeType;
  }

  get gasEstimate() {
    return this.quoteResult.gasEstimate;
  }

  get slippagePercentage() {
    return this.tradeRequest.slippagePercentage;
  }

  get tokenIn() {
    return this.tradeRequest.tokenIn;
  }
}
