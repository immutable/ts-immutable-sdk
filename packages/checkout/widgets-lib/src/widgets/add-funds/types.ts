import { TokenBalance } from '@0xsquid/sdk/dist/types';
import { RouteResponse, Token } from '@0xsquid/squid-types';

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
