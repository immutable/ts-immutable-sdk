import { ethers } from 'ethers';
import { Currency, TradeType } from '@uniswap/sdk-core';
import { Route } from '@uniswap/v3-sdk';

export type TradeInfo = {
  route: Route<Currency, Currency>;
  amountIn: ethers.BigNumberish;
  tokenIn: Currency;
  amountOut: ethers.BigNumberish;
  tokenOut: Currency;
  tradeType: TradeType;
};

export type QuoteResponse =
  | {
      success: true;
      trade: TradeInfo;
    }
  | {
      success: false;
      trade: undefined;
    };
