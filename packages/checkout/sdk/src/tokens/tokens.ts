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
  const fetcher = config.remoteConfigFetcher;

  switch (type) {
    // Get tokens for SWAP. Swap is only available on L2. Enforce a L2 chain ID.
    case TokenFilterTypes.SWAP:
      if (chainId !== ENVIRONMENT_L2_CHAIN_MAP[config.environment]) {
        throw new CheckoutError(
          `Unsupported chain:${chainId} for swapping tokens`,
          CheckoutErrorType.CHAIN_NOT_SUPPORTED_ERROR,
        );
      }
      // Fetch tokens from dex-tokens config because
      // Dex needs to have a whitelisted list of tokens due to
      // legal reasons.
      tokens = ((await fetcher.getConfig('dex')) as DexConfig)
        .tokens || [];
      break;

    case TokenFilterTypes.BRIDGE:
    case TokenFilterTypes.ALL:
    default:
      tokens = (await fetcher.getTokens(chainId)) as TokenInfo[];
  }

  if (!exclude || exclude?.length === 0) return { tokens };

  return {
    tokens: tokens.filter((token) => !exclude.map((ecl) => ecl.address).includes(token.address || '')) as TokenInfo[],
  };
};
