import {
  DexConfig,
  GetTokenAllowListParams,
  GetTokenAllowListResult,
  OnRampConfig,
  TokenFilterTypes,
  TokenInfo,
} from '../types';
import { CheckoutConfiguration } from '../config';

export const getTokenAllowList = async (
  config: CheckoutConfiguration,
  {
    type = TokenFilterTypes.ALL, chainId, exclude, onRampProvider,
  }: GetTokenAllowListParams,
): Promise<GetTokenAllowListResult> => {
  let tokens: TokenInfo[] = [];

  switch (type) {
    case TokenFilterTypes.SWAP:
      // Fetch tokens from dex-tokens config because
      // Dex needs to have a whitelisted list of tokens due to
      // legal reasons.
      tokens = ((await config.remote.getConfig('dex')) as DexConfig)
        .tokens || [];
      break;
    case TokenFilterTypes.ONRAMP:
      tokens = ((await config.remote.getConfig('onramp')) as OnRampConfig)[onRampProvider ?? 'transak'].tokens || [];
      break;
    case TokenFilterTypes.BRIDGE:
    case TokenFilterTypes.ALL:
    default:
      tokens = (await config.remote.getTokens(chainId)) as TokenInfo[];
  }

  if (!exclude || exclude?.length === 0) return { tokens };

  return {
    tokens: tokens.filter((token) => !exclude.map((e) => e.address).includes(token.address || '')) as TokenInfo[],
  };
};
