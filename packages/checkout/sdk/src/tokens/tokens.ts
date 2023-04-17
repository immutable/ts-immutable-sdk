import {
  GetTokenAllowListParams,
  GetTokenAllowListResult,
  TokenFilterTypes,
  TokenInfo,
} from '../types';
import masterTokenList from './token_master_list.json';

export const getTokenAllowList = function ({
    type = TokenFilterTypes.ALL,
    chainId,
    exclude
  }: GetTokenAllowListParams
): GetTokenAllowListResult {
  const filteredTokenList = masterTokenList.filter(
    (token) => {
      const chainIdMatches = token.chainId == chainId
      const tokenNotExcluded = !exclude?.includes({address: token.address || ""})
      const allowAllTokens = type === TokenFilterTypes.ALL
      const tokenAllowedForType = token.tokenFeatures.includes(type)

      return  chainIdMatches && tokenNotExcluded && (allowAllTokens || tokenAllowedForType)
    }
  ).map((token) => {
    const {
      chainId,
      tokenFeatures,
      ...tokenInfo
    } = token;
    return tokenInfo as TokenInfo;
  })

  return {
    tokens: filteredTokenList,
  };
};
