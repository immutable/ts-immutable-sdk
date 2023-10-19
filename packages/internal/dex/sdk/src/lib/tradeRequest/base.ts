/* eslint-disable @typescript-eslint/lines-between-class-members */
import { TradeType } from '@uniswap/sdk-core';
import { QuoteResult } from 'lib/getQuotesForRoutes';
import { NativeTokenService } from 'lib/nativeTokenService';
import { Quote } from 'lib/quote/base';
import { SecondaryFee, ERC20, CoinAmount } from 'types';

export abstract class TradeRequest {
  quote: QuoteResult | null;

  constructor(
    readonly secondaryFees: SecondaryFee[],
    readonly slippagePercentage: number,
    readonly maxHops: number,
    readonly tradeType: TradeType,
    protected nativeTokenService: NativeTokenService,
  ) {
    this.quote = null;
    this.secondaryFees = secondaryFees;
    this.slippagePercentage = slippagePercentage;
    this.maxHops = maxHops;
    this.tradeType = tradeType;
    this.nativeTokenService = nativeTokenService;
  }

  abstract getBestQuote(quotes: QuoteResult[]): Quote;

  abstract tokenIn: ERC20;
  abstract tokenOut: ERC20;
  abstract ourQuoteReqAmount: CoinAmount<ERC20>;
  abstract otherToken: ERC20;
  abstract specifiedAmount: CoinAmount<ERC20>;
}
