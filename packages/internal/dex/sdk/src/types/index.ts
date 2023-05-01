import { ethers } from 'ethers';
import { Currency, TradeType } from '@uniswap/sdk-core';
import { Route } from '@uniswap/v3-sdk';
import { ModuleConfiguration } from '@imtbl/config';
import { ExchangeContracts } from 'config';

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

export type TokenInfo = {
  chainId: number;
  address: string;
  decimals: number;
  symbol?: string;
  name?: string;
};

export interface ExchangeOverrides {
  rpcURL: string;
  exchangeContracts: ExchangeContracts;
  commonRoutingTokens: TokenInfo[];
}

export interface ExchangeModuleConfiguration
  extends ModuleConfiguration<ExchangeOverrides> {
  chainId: number; // TODO - union of Sandbox/Prod chains?
}
