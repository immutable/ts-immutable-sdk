import { TokenBalance } from '@0xsquid/sdk/dist/types';
import { RouteResponse, Token } from '@0xsquid/squid-types';

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
  iconUrl:string;
};

export type AmountData = {
  fromToken: Token;
  fromAmount: string;
  toToken: Token;
  toAmount: string;
  balance: TokenBalance;
};

export type RouteData = {
  amountData: AmountData;
  route: RouteResponse;
};

export enum FiatOptionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}
