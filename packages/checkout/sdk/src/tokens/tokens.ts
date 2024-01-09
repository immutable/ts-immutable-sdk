import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
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

  const localChainId = chainId ?? getL1ChainId(config);

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
      // Only using Transak as it's the only on-ramp provider at the moment
      if (!onRampConfig) {
        tokens = [];
      }
      tokens = onRampConfig[OnRampProvider.TRANSAK]?.tokens || [];
      break;
    case TokenFilterTypes.BRIDGE:
      onBridgeConfig = ((await config.remote.getConfig('bridge')) as BridgeConfig);

      // Only using Transak as it's the only on-ramp provider at the moment
      if (!onBridgeConfig) {
        tokens = [];
      }

      tokens = onBridgeConfig[localChainId]?.tokens || [];
      break;
    case TokenFilterTypes.ALL:
    default:
      tokens = (await config.remote.getTokensConfig(localChainId)).allowed as TokenInfo[];
  }

  if (!exclude || exclude?.length === 0) return { tokens };

  return {
    tokens: tokens.filter((token) => !exclude.map((e) => e.address).includes(token.address || '')) as TokenInfo[],
  };
};

export const isNativeToken = (
  address: string | undefined,
): boolean => !address || address.toLocaleLowerCase() === NATIVE;

export async function getERC20TokenInfo(
  web3Provider: Web3Provider | JsonRpcProvider,
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
