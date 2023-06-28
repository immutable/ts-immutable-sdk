import {
  ENVIRONMENT_L2_CHAIN_MAP,
  GetTokenAllowListParams,
  GetTokenAllowListResult,
  TokenFilterTypes,
  TokenInfo,
} from '../types';
import { CheckoutConfiguration } from '../config';
import { DexConfig } from '../config/remoteConfigType';
import { CheckoutError, CheckoutErrorType } from '../errors';

export const getTokenAllowList = async (
  config: CheckoutConfiguration,
  { type = TokenFilterTypes.ALL, chainId, exclude }: GetTokenAllowListParams,
): Promise<GetTokenAllowListResult> => {
  let tokens: TokenInfo[] = [];

  switch (type) {
    case TokenFilterTypes.SWAP:
      // confirm chainId is the L2 supported chain
      if (chainId !== ENVIRONMENT_L2_CHAIN_MAP[config.environment]) {
        throw new CheckoutError(
          `Unsupported chain:${chainId} for swapping tokens`,
          CheckoutErrorType.CHAIN_NOT_SUPPORTED_ERROR,
        );
      }
      // fetch tokens from dex-tokens config
      tokens = ((await config.remoteConfigFetcher.getConfig('dex')) as DexConfig)
        .tokens || [];
      break;
    case TokenFilterTypes.BRIDGE:
    case TokenFilterTypes.ALL:
    default:
      tokens = (await config.remoteConfigFetcher.getTokens(
        chainId,
      )) as TokenInfo[];
      break;
  }

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
