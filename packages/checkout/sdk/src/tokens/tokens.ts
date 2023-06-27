import { CheckoutConfiguration } from '../config';
import {
  ENVIRONMENT_L2_CHAIN_MAP,
  GetTokenAllowListParams,
  GetTokenAllowListResult,
  TokenFilterTypes,
  TokenInfo,
  TokenMasterInfo,
} from '../types';

const filterTokenList = (
  config: CheckoutConfiguration,
  tokens: TokenMasterInfo[],
  { type, exclude }: GetTokenAllowListParams,
): TokenMasterInfo[] => tokens.filter((token) => {
  const tokenNotExcluded = !exclude
    ?.map((excludeToken) => excludeToken.address)
    .includes(token.address || '');
  const allowAllTokens = type === TokenFilterTypes.ALL;
  const tokenAllowedForType = token.tokenFeatures.includes(type);

  return tokenNotExcluded && (allowAllTokens || tokenAllowedForType);
}) as TokenMasterInfo[];

export const getTokenAllowList = async (
  config: CheckoutConfiguration,
  { type = TokenFilterTypes.ALL, chainId, exclude }: GetTokenAllowListParams,
): Promise<GetTokenAllowListResult> => {
  // L1 does not have an allow list
  const tokensForChainId = chainId ?? ENVIRONMENT_L2_CHAIN_MAP[config.environment];
  const tokensList = (await config.remoteConfigFetcher.getTokens(
    tokensForChainId,
  )) as TokenInfo[];

  const tokens = tokensList.map(
    (tokenData: TokenInfo) => ({
      address: tokenData.address,
      icon: tokenData.icon,
      name: tokenData.name,
      symbol: tokenData.symbol,
      decimals: tokenData.decimals,
      chainId,
      tokenFeatures: [TokenFilterTypes.SWAP],
    } as TokenMasterInfo),
  );
  const filteredTokenList = filterTokenList(config, tokens, {
    type,
    chainId,
    exclude,
  }).map(
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
