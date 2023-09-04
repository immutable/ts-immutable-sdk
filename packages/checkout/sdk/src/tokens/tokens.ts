import {
  ChainId,
  DexConfig,
  GetTokenAllowListResult,
  OnRampConfig,
  TokenFilter,
  TokenFilterTypes,
  TokenInfo,
} from '../types';
import { CheckoutConfiguration, getL1ChainId } from '../config';

type TokenAllowListParams = {
  type: TokenFilterTypes;
  chainId?: ChainId;
  exclude?: TokenFilter[];
};

export const getTokenAllowList = async (
  config: CheckoutConfiguration,
  {
    type = TokenFilterTypes.ALL, chainId, exclude,
  }: TokenAllowListParams,
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
      // Only using transak as it's the only on-ramp provider at the moment
      tokens = ((await config.remote.getConfig('onramp')) as OnRampConfig)?.transak?.tokens || [];
      break;
    case TokenFilterTypes.BRIDGE:
    case TokenFilterTypes.ALL:
    default:
      tokens = (await config.remote.getTokens(chainId || getL1ChainId(config))) as TokenInfo[];
  }

  if (!exclude || exclude?.length === 0) return { tokens };

  return {
    tokens: tokens.filter((token) => !exclude.map((e) => e.address).includes(token.address || '')) as TokenInfo[],
  };
};
