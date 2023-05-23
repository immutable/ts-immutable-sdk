import { ethers } from 'ethers';
import { Currency, TradeType } from '@uniswap/sdk-core';
import { Route } from '@uniswap/v3-sdk';
import { ModuleConfiguration } from '@imtbl/config';
import { ExchangeContracts } from 'config';

export type Amount = {
  token: TokenInfo;
  amount: ethers.BigNumberish;
};

export type QuoteTradeInfo = {
  route: Route<Currency, Currency>;
  amountIn: ethers.BigNumber;
  tokenIn: Currency;
  amountOut: ethers.BigNumber;
  tokenOut: Currency;
  tradeType: TradeType;
  gasEstimate: ethers.BigNumber
};

export type QuoteResponse = {
  trade: QuoteTradeInfo;
};

export type TradeInfo = {
  quote: Amount;
  quoteWithMaxSlippage: Amount;
  gasFeeEstimate: Amount | null
  slippage: number;
};

export type TransactionResponse = {
  approveTransaction: ethers.providers.TransactionRequest | null;
  transaction: ethers.providers.TransactionRequest;
  info: TradeInfo;
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
  nativeToken: TokenInfo;
}

export interface ExchangeModuleConfiguration
  extends ModuleConfiguration<ExchangeOverrides> {
  chainId: number; // TODO - union of Sandbox/Prod chains?
}
