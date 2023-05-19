import { Token } from '@uniswap/sdk-core';
import { ExchangeContracts } from 'config';
import { TokenInfo } from 'types';

export type Chain = {
  chainId: number;
  rpcUrl: string;
  contracts: ExchangeContracts;
  commonRoutingTokens: Token[];
  nativeToken: TokenInfo;
};
