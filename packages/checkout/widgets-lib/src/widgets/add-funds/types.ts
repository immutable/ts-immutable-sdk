import { RouteResponse, Token } from '@0xsquid/squid-types';
import { TokenBalance } from '@imtbl/checkout-sdk';

export type Chain = {
  id: string;
  type: string;
  name: string;
  iconUrl: string;
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
