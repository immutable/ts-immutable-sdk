import { CheckoutConfiguration, getL1ChainId, getL2ChainId } from '../../config';
import {
  BridgeConfig,
  DexConfig, OnRampConfig,
  RoutingOptionsAvailable,
  TokenInfo,
} from '../../types';
import { TokenBalanceResult, TokenBalances } from '../routing/types';
import { OnRampTokensAllowList, RoutingTokensAllowList } from './types';

/* eslint-disable arrow-body-style */

const filterTokens = (allowedTokens: TokenInfo[], balances: TokenBalanceResult | undefined) => {
  if (balances && balances.success) {
    return allowedTokens.filter((token) => {
      return balances.balances.find((balance) => {
        return balance.token.address === token.address && balance.balance.gt(0);
      });
    });
  }

  return [];
};

export const allowListCheckForOnRamp = async (
  config: CheckoutConfiguration,
  availableRoutingOptions: RoutingOptionsAvailable,
) : Promise<OnRampTokensAllowList> => {
  if (availableRoutingOptions.onRamp) {
    const onRampOptions = await config.remote.getConfig('onramp') as OnRampConfig;
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
  availableRoutingOptions: RoutingOptionsAvailable,
) : Promise<TokenInfo[]> => {
  if (availableRoutingOptions.bridge) {
    const allowedTokens = ((await config.remote.getConfig('bridge')) as BridgeConfig)?.tokens ?? [];
    const balances = tokenBalances.get(getL1ChainId(config));
    return filterTokens(allowedTokens, balances);
  }

  return [];
};

export const allowListCheckForSwap = async (
  config: CheckoutConfiguration,
  tokenBalances: TokenBalances,
  availableRoutingOptions: RoutingOptionsAvailable,
) : Promise<TokenInfo[]> => {
  if (availableRoutingOptions.swap) {
    const allowedTokens = ((await config.remote.getConfig('dex')) as DexConfig)?.tokens ?? [];
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
  availableRoutingOptions: RoutingOptionsAvailable,
) : Promise<RoutingTokensAllowList> => {
  const tokenAllowList: RoutingTokensAllowList = {};
  tokenAllowList.swap = await allowListCheckForSwap(config, tokenBalances, availableRoutingOptions);
  tokenAllowList.bridge = await allowListCheckForBridge(config, tokenBalances, availableRoutingOptions);
  tokenAllowList.onRamp = await allowListCheckForOnRamp(config, availableRoutingOptions);

  return tokenAllowList;
};
