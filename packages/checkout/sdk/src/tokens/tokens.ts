import { StaticJsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import { Contract } from 'ethers';
import {
  BridgeConfig,
  ChainId,
  DexConfig,
  GetTokenAllowListResult,
  OnRampConfig, OnRampProvider,
  TokenFilter,
  TokenFilterTypes,
  TokenInfo,
} from '../types';
import { CheckoutConfiguration, getL1ChainId } from '../config';
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
  let onBridgeConfig: BridgeConfig;

  const targetChainId = chainId ?? getL1ChainId(config);

  switch (type) {
    case TokenFilterTypes.SWAP:
      // Fetch tokens from dex-tokens config because
      // Dex needs to have a whitelisted list of tokens due to
      // legal reasons.
      tokens = ((await config.remote.getConfig('dex')) as DexConfig)
        .tokens || [];
      break;
    case TokenFilterTypes.ONRAMP:
      onRampConfig = (await config.remote.getConfig('onramp')) as OnRampConfig;
      if (!onRampConfig) tokens = [];

      tokens = onRampConfig[OnRampProvider.TRANSAK]?.tokens || [];
      break;
    case TokenFilterTypes.BRIDGE:
      onBridgeConfig = ((await config.remote.getConfig('bridge')) as BridgeConfig);
      if (!onBridgeConfig) tokens = [];

      tokens = onBridgeConfig[targetChainId]?.tokens || [];
      break;
    case TokenFilterTypes.ALL:
    default:
      tokens = (await config.remote.getTokensConfig(targetChainId)).allowed as TokenInfo[];
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
  web3Provider: Web3Provider | StaticJsonRpcProvider,
  tokenAddress: string,
) {
  return await withCheckoutError<TokenInfo>(
    async () => {
      const contract = new Contract(tokenAddress, JSON.stringify(ERC20ABI), web3Provider);

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
