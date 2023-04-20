import { ethers } from 'ethers';
import { Currency, TradeType } from '@uniswap/sdk-core';
import { Route } from '@uniswap/v3-sdk';
import { ModuleConfiguration } from '@imtbl/config/src';

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

export type TransactionResponse =
  | {
      transactionRequest: ethers.providers.TransactionRequest;
      success: true;
    }
  | {
      success: false;
      transactionRequest: undefined;
    };

export interface DexOverrides {
  chainId: number;
}

export interface DexModuleConfiguration
  extends ModuleConfiguration<DexOverrides> {}
