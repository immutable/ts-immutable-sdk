import {
  GetTokenAllowListParams,
  GetTokenAllowListResult,
  TokenFilterTypes,
  TokenInfo,
  TokenMasterInfo,
} from '../types';
import masterTokenList from './token_master_list.json';

const filterTokenList = ({
  type,
  chainId,
  exclude,
}: GetTokenAllowListParams): TokenMasterInfo[] => masterTokenList
  .filter((token) => {
    const skipChainIdCheck = !chainId;
    const chainIdMatches = token.chainId === chainId;
    const tokenNotExcluded = !exclude
      ?.map((excludeToken) => excludeToken.address)
      .includes(token.address || '');
    const allowAllTokens = type === TokenFilterTypes.ALL;
    const tokenAllowedForType = token.tokenFeatures.includes(type);

    return (
      (skipChainIdCheck || chainIdMatches)
        && tokenNotExcluded
        && (allowAllTokens || tokenAllowedForType)
    );
  }) as TokenMasterInfo[];

export const getTokenAllowList = async ({
  type = TokenFilterTypes.ALL,
  chainId,
  exclude,
}: GetTokenAllowListParams): Promise<GetTokenAllowListResult> => {
  // todo:For API call, use the CheckoutError with errorType:API_CALL_ERROR?? or any other

  const filteredTokenList = filterTokenList({ type, chainId, exclude }).map(
    (token) => {
      // TODO fix variable shadowing
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const { chainId, tokenFeatures, ...tokenInfo } = token;
      return tokenInfo as TokenInfo;
    },
  );

  return {
    tokens: filteredTokenList,
  };
};
