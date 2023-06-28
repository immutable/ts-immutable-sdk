import {
  GetTokenAllowListParams,
  GetTokenAllowListResult,
  TokenInfo,
} from '../types';
import { CheckoutConfiguration } from '../config';

export const getTokenAllowList = async (
  config: CheckoutConfiguration,
  { chainId, exclude }: GetTokenAllowListParams,
): Promise<GetTokenAllowListResult> => {
  const tokens = (await config.remoteConfigFetcher.getTokens(
    chainId,
  )) as TokenInfo[];

  const filteredTokenList = tokens.filter((token) => {
    const tokenNotExcluded = !exclude
      ?.map((excludeToken) => excludeToken.address)
      .includes(token.address || '');
    return tokenNotExcluded;
  }) as TokenInfo[];

  return {
    tokens: filteredTokenList,
  };
};
