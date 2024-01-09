import { CheckoutConfiguration, getL1ChainId, getL2ChainId } from '../../config';
import { getTokenAllowList } from '../../tokens';
import {
  AvailableRoutingOptions,
  TokenInfo,
  TokenFilterTypes,
} from '../../types';
import { TokenBalanceResult, TokenBalances } from '../routing/types';
import { OnRampTokensAllowList, RoutingTokensAllowList } from './types';

const filterTokens = (allowedTokens: TokenInfo[], balances: TokenBalanceResult | undefined) => {
  if (balances && balances.success) {
    return allowedTokens.filter((token) => {
      if ('address' in token) {
        return balances.balances.find((balance) => balance.token.address === token.address && balance.balance.gt(0));
      }
      return balances.balances.find((balance) => !('address' in balance.token) && balance.balance.gt(0));
    });
  }

  return [];
};

export const allowListCheckForOnRamp = async (
  config: CheckoutConfiguration,
  availableRoutingOptions: AvailableRoutingOptions,
) : Promise<OnRampTokensAllowList> => {
  if (availableRoutingOptions.onRamp) {
    const onRampOptions = (await getTokenAllowList(config, { type: TokenFilterTypes.ONRAMP }));
    const onRampAllowList: OnRampTokensAllowList = {};
    Object.entries(onRampOptions)
      .forEach(([onRampProvider, onRampProviderConfig]) => {
        // Allowed list per onRamp provider
        onRampAllowList[onRampProvider] = onRampProviderConfig.tokens ?? [];
      });
    return onRampAllowList;
  }

  return {};
};

export const allowListCheckForBridge = async (
  config: CheckoutConfiguration,
  tokenBalances: TokenBalances,
  availableRoutingOptions: AvailableRoutingOptions,
) : Promise<TokenInfo[]> => {
  if (availableRoutingOptions.bridge) {
    const chainId = getL1ChainId(config);
    const allowedTokens = (await getTokenAllowList(config, { type: TokenFilterTypes.BRIDGE, chainId })).tokens;
    const balances = tokenBalances.get(chainId);
    return filterTokens(allowedTokens, balances);
  }

  return [];
};

export const allowListCheckForSwap = async (
  config: CheckoutConfiguration,
  tokenBalances: TokenBalances,
  availableRoutingOptions: AvailableRoutingOptions,
) : Promise<TokenInfo[]> => {
  if (availableRoutingOptions.swap) {
    const allowedTokens = (await getTokenAllowList(config, { type: TokenFilterTypes.SWAP })).tokens;
    const balances = tokenBalances.get(getL2ChainId(config));
    return filterTokens(allowedTokens, balances);
  }

  return [];
};

/**
 * Checks the user balances against the route option allowlists.
 */
export const allowListCheck = async (
  config: CheckoutConfiguration,
  tokenBalances: TokenBalances,
  availableRoutingOptions: AvailableRoutingOptions,
) : Promise<RoutingTokensAllowList> => {
  const tokenAllowList: RoutingTokensAllowList = {};
  tokenAllowList.swap = await allowListCheckForSwap(config, tokenBalances, availableRoutingOptions);
  tokenAllowList.bridge = await allowListCheckForBridge(config, tokenBalances, availableRoutingOptions);
  tokenAllowList.onRamp = await allowListCheckForOnRamp(config, availableRoutingOptions);

  return tokenAllowList;
};
