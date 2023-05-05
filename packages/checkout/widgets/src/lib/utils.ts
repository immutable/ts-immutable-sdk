import { ChainId, GetBalanceResult } from '@imtbl/checkout-sdk-web';

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
