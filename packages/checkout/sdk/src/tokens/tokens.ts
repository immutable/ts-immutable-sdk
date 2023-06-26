import axios from 'axios';
import { CheckoutConfiguration } from '../config';
import {
  ChainId,
  ENVIRONMENT_L2_CHAIN_MAP,
  GetTokenAllowListParams,
  GetTokenAllowListResult,
  TokenFilterTypes,
  TokenInfo,
  TokenMasterInfo,
} from '../types';
import { IndexerConfig } from '../config/remoteConfigType';

export async function getAllL2Tokens(
  config: CheckoutConfiguration,
): Promise<TokenMasterInfo[]> {
  const indexerConfig = (await config.remoteConfigFetcher.get(
    'indexer',
  )) as IndexerConfig;
  const indexer = indexerConfig?.urls?.filter(
    (url) => url.chainId === ENVIRONMENT_L2_CHAIN_MAP[config.environment],
  )[0];
  if (!indexer) {
    return [];
  }
  let response;
  try {
    response = await axios.get(`${indexer.rootUrl}${indexer.tokensPath}`);
  } catch (error: any) {
    throw new Error(`Error fetching tokens: ${error.message}`);
  }

  if (response.status !== 200 || response.data === undefined) {
    throw new Error(
      `Error fetching tokens: ${response.status} ${response.statusText}`,
    );
  }

  const tokens = response.data.result.map(
    (tokenData: {
      chain: { id: string };
      name: any;
      symbol: any;
      decimals: any;
      // eslint-disable-next-line @typescript-eslint/naming-convention
      contract_address: any;
      // eslint-disable-next-line @typescript-eslint/naming-convention
      image_url: any;
    }) => ({
      address: tokenData.contract_address,
      icon: tokenData.image_url,
      chainId: tokenData.chain.id.split(':')[1] as unknown as ChainId,
      tokenFeatures: [TokenFilterTypes.SWAP],
    } as TokenMasterInfo),
  );

  return tokens;
}

const filterTokenList = (
  config: CheckoutConfiguration,
  tokens: TokenMasterInfo[],
  { type, chainId, exclude }: GetTokenAllowListParams,
): TokenMasterInfo[] => tokens.filter((token) => {
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
  { type = TokenFilterTypes.ALL, chainId, exclude }: GetTokenAllowListParams,
): Promise<GetTokenAllowListResult> => {
  // L1 does not have an allow list
  const tokens = await getAllL2Tokens(config);

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
