import {
  ChainId,
  Checkout, TokenFilterTypes,
} from '@imtbl/checkout-sdk';

// Hook to set the token symbols in the CryptoFiat context
// if no chainId is passed then it will use the environment
// to fetch all the tokens for the chains for the given
// environment
export const fetchTokenSymbols = async (
  checkout: Checkout | null,
  chainId: ChainId,
): Promise<string[]> => {
  if (!checkout) return [];

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
