/* eslint-disable @typescript-eslint/lines-between-class-members */
import { TradeType } from '@uniswap/sdk-core';
import { ethers } from 'ethers';
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
    protected nativeTokenService: NativeTokenService,
  ) {
    this.quote = null;
    this.secondaryFees = secondaryFees;
    this.slippagePercentage = slippagePercentage;
    this.maxHops = maxHops;
    this.nativeTokenService = nativeTokenService;
  }

  abstract buildQuoteAmountIn(value: ethers.BigNumber, token: ERC20): CoinAmount<ERC20>;
  abstract buildQuoteAmountOut(value: ethers.BigNumber, token: ERC20): CoinAmount<ERC20>;
  abstract addBestQuote(quotes: QuoteResult[]): Quote;

  abstract tokenIn: ERC20;
  abstract tokenOut: ERC20;
  abstract ourQuoteReqAmount: CoinAmount<ERC20>;
  abstract otherToken: ERC20;
  abstract specifiedAmount: CoinAmount<ERC20>;
  abstract tradeType: TradeType;
}
