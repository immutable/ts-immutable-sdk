import { Network } from '@ethersproject/providers';
import { ChainId, GetBalanceResult, NetworkInfo } from '@imtbl/checkout-sdk';

export const sortTokensByAmount = (
  tokens: GetBalanceResult[],
  chainId: ChainId
) => {
  return tokens.sort((a, b) => {
    if (
      chainId === ChainId.POLYGON &&
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

export const sortNetworksCompareFn = (a: NetworkInfo, b: NetworkInfo) => {
  // make sure POLYGON at start of the list
  if(a.chainId === ChainId.POLYGON){
    return -1;
  }
  if(a.chainId === ChainId.ETHEREUM) {
    return 0;
  }
  return 1;
}
