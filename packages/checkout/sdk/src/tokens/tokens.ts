import { CheckoutConfiguration } from '../config';
import {
  GetTokenAllowListParams,
  GetTokenAllowListResult,
  TokenFilterTypes,
  TokenInfo,
  TokenMasterInfo,
} from '../types';
import masterTokenList from './token_master_list.json';

const filterTokenList = (
  config: CheckoutConfiguration,
  {
    type,
    chainId,
    exclude,
  }: GetTokenAllowListParams,
): TokenMasterInfo[] => masterTokenList.filter((token) => {
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

export const getTokenAllowList = async (
  config: CheckoutConfiguration,
  {
    type = TokenFilterTypes.ALL,
    chainId,
    exclude,
  }: GetTokenAllowListParams,
): Promise<GetTokenAllowListResult> => {
  const filteredTokenList = filterTokenList(config, { type, chainId, exclude }).map(
    (token: TokenMasterInfo): TokenInfo => ({
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals,
      address: token.address,
      icon: token.icon,
    }),
  );

  return {
    tokens: filteredTokenList,
  };
};
