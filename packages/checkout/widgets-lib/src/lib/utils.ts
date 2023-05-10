import { ChainId, GetBalanceResult, NetworkInfo } from '@imtbl/checkout-sdk';
import { L1Network, zkEVMNetwork } from './networkUtils';
import { Environment } from '@imtbl/config';

export const sortTokensByAmount = (
  environment: Environment,
  tokens: GetBalanceResult[],
  chainId: ChainId
) => {
  return tokens.sort((a, b) => {
    if (
      chainId === zkEVMNetwork(environment) &&
      a.token.symbol.toLowerCase() === 'imx' &&
      b.token.symbol.toLowerCase() !== 'imx'
    ) {
      return -1;
    }

    if (a.balance.lt(b.balance)) {
      return 1;
    }
    if (a.balance.gt(b.balance)) {
      return -1;
    }
    return 0;
  });
};

export const sortNetworksCompareFn = (a: NetworkInfo, b: NetworkInfo, environment: Environment) => {
  // make sure zkEVM at start of the list then L1
  if(a.chainId === zkEVMNetwork(environment)){
    return -1;
  }
  if(a.chainId === L1Network(environment)) {
    return 0;
  }
  return 1;
}
