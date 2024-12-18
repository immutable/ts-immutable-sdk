import { TokenBalance } from '@0xsquid/sdk/dist/types';
import { RouteResponse } from '@0xsquid/squid-types';

export type Token = {
  chainId: string;
  address: string;
  decimals: number;
  symbol?: string;
  name?: string;
  usdPrice: number;
  iconUrl: string;
};

export type Chain = {
  id: string;
  type: string;
  name: string;
  iconUrl: string;
  nativeCurrency: NativeCurrency;
};

export type NativeCurrency = {
  name: string;
  symbol: string;
  decimals: number;
  iconUrl: string;
};

export type AmountData = {
  fromToken: Token;
  fromAmount: string;
  toToken: Token;
  toAmount: string;
  balance: TokenBalance;
  additionalBuffer: number;
  isInsufficientGas: boolean;
  isInsufficientBalance: boolean;
};

export type RouteData = {
  amountData: AmountData;
  route: RouteResponse;
  isInsufficientGas: boolean;
  isInsufficientBalance: boolean;
};

export type RouteResponseData = {
  route?: RouteResponse;
  additionalBuffer?: number;
};
