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

export type FromAmountData = {
  fromToken: Token;
  fromAmount: string;
  toToken: Token;
  toAmount: string;
  balance: TokenBalance;
  additionalBuffer: number;
};

export type RouteData = {
  amountData: FromAmountData;
  route: RouteResponse;
  isInsufficientGas: boolean;
};

export type RouteResponseData = {
  route?: RouteResponse;
  additionalBuffer?: number;
};
