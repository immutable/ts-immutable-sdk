import { Contract, JsonRpcProvider, BrowserProvider } from 'ethers';
import {
  ChainId,
  DexConfig,
  GetTokenAllowListResult,
  OnRampConfig, OnRampProvider,
  TokenFilter,
  TokenFilterTypes,
  TokenInfo,
} from '../types';
import { CheckoutConfiguration, getL1ChainId, getL2ChainId } from '../config';
import { ERC20ABI, NATIVE } from '../env';
import { CheckoutErrorType, withCheckoutError } from '../errors';
import { isMatchingAddress } from '../utils/utils';

type TokenAllowListParams = {
  type: TokenFilterTypes;
  chainId?: ChainId;
  exclude?: TokenFilter[];
};

export const getTokenAllowList = async (
  config: CheckoutConfiguration,
  {
    type = TokenFilterTypes.ALL,
    chainId,
    exclude,
  }: TokenAllowListParams,
): Promise<GetTokenAllowListResult> => {
  let tokens: TokenInfo[] = [];
  let onRampConfig: OnRampConfig;
  let blockedTokens: string[];

  const targetChainId = chainId ?? getL1ChainId(config);
  const dexChainId = getL2ChainId(config);

  switch (type) {
    case TokenFilterTypes.SWAP:
      tokens = (await config.tokens.getTokensConfig(dexChainId));

      // Fetch tokens from dex-tokens config because
      // Dex needs to have a whitelisted list of tokens due to
      // legal reasons.
      blockedTokens = (
        ((await config.remote.getConfig('dex')) as DexConfig)?.blocklist || []
      ).map((token) => token.address.toLowerCase());

      tokens = tokens.filter((token) => token.address && !blockedTokens.includes(token.address));

      break;
    case TokenFilterTypes.ONRAMP:
      onRampConfig = (await config.remote.getConfig('onramp')) as OnRampConfig;
      if (!onRampConfig) tokens = [];

      tokens = onRampConfig[OnRampProvider.TRANSAK]?.tokens || [];
      break;
    case TokenFilterTypes.BRIDGE:
    case TokenFilterTypes.ALL:
    default:
      tokens = (await config.tokens.getTokensConfig(targetChainId));
  }

  if (!exclude || exclude?.length === 0) return { tokens };

  return {
    tokens: tokens.filter((token) => !exclude.map((e) => e.address).includes(token.address || '')) as TokenInfo[],
  };
};

export const isNativeToken = (
  address: string | undefined,
): boolean => !address || isMatchingAddress(address, NATIVE);

export async function getERC20TokenInfo(
  browserProvider: BrowserProvider | JsonRpcProvider,
  tokenAddress: string,
) {
  return await withCheckoutError<TokenInfo>(
    async () => {
      const contract = new Contract(tokenAddress, JSON.stringify(ERC20ABI), browserProvider);

      const [name, symbol, decimals] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
      ]);

      return {
        name,
        symbol,
        decimals,
        address: tokenAddress,
      };
    },
    { type: CheckoutErrorType.GET_ERC20_INFO_ERROR },
  );
}
