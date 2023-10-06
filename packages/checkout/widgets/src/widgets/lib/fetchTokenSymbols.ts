import {
  ChainId,
  Checkout,
  TokenFilterTypes,
} from '@imtbl/checkout-sdk';

export const fetchTokenSymbols = async (
  checkout: Checkout,
  chainId: ChainId,
): Promise<string[]> => {
  const tokenAllowList = await checkout.getTokenAllowList({
    type: TokenFilterTypes.ALL,
    chainId,
  });

  const symbolSet = new Set<string>();

  tokenAllowList.tokens.forEach((token) => {
    symbolSet.add(token.symbol);
  });

  return Array.from(symbolSet);
};
