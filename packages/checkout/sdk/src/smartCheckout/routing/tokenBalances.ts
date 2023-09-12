import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import { CheckoutConfiguration, getL1ChainId, getL2ChainId } from '../../config';
import { ChainId, GetAllBalancesResult, RoutingOptionsAvailable } from '../../types';
import { createReadOnlyProviders } from '../../readOnlyProviders/readOnlyProvider';
import { getAllBalances } from '../../balances';
import { CheckoutError, CheckoutErrorType } from '../../errors';
import { TokenBalanceResult } from './types';

export const getAllTokenBalances = async (
  config: CheckoutConfiguration,
  ownerAddress: string,
  availableRoutingOptions: RoutingOptionsAvailable,
) => {
  const chainBalances: Map<ChainId, TokenBalanceResult> = new Map();
  const chainBalancePromises: Map<ChainId, Promise<GetAllBalancesResult>> = new Map();
  let readOnlyProviders: Map<ChainId, JsonRpcProvider> = new Map<ChainId, JsonRpcProvider>();
  let providerError: any;
  try {
    readOnlyProviders = await createReadOnlyProviders(config);
  } catch (error) {
    providerError = error;
  }

  if (readOnlyProviders.size === 0) {
    const noProviderResult = {
      success: false,
      error: providerError || new CheckoutError('Provider failed', CheckoutErrorType.PROVIDER_ERROR),
      balances: [],
    };
    chainBalances.set(getL1ChainId(config), noProviderResult);
    chainBalances.set(getL2ChainId(config), noProviderResult);
    return chainBalances;
  }

  // Only get L1 Balances if we can bridge
  if (availableRoutingOptions.bridge) {
    const chainId = getL1ChainId(config);
    if (readOnlyProviders.has(chainId)) {
      chainBalancePromises.set(chainId, getAllBalances(
        config,
        readOnlyProviders.get(chainId) as Web3Provider,
        ownerAddress,
        chainId,
      ));
    } else {
      chainBalances.set(getL1ChainId(config), {
        success: false,
        error: new CheckoutError(`No L1 provider available for ${chainId}`, CheckoutErrorType.PROVIDER_ERROR),
        balances: [],
      });
    }
  }

  const chainId = getL2ChainId(config);
  if (readOnlyProviders.has(chainId)) {
    chainBalancePromises.set(chainId, getAllBalances(
      config,
      readOnlyProviders.get(chainId) as Web3Provider,
      ownerAddress,
      chainId,
    ));
  } else {
    chainBalances.set(getL2ChainId(config), {
      success: false,
      error: new CheckoutError(`No L2 provider available for ${chainId}`, CheckoutErrorType.PROVIDER_ERROR),
      balances: [],
    });
  }

  if (chainBalancePromises.size > 0) {
    const chainIds = Array.from(chainBalancePromises.keys());
    const balanceSettledResults = await Promise.allSettled(chainBalancePromises.values());
    balanceSettledResults.forEach((balanceSettledResult, index: number) => {
      const balanceChainId = chainIds[index];
      if (balanceSettledResult.status === 'fulfilled') {
        chainBalances.set(balanceChainId, {
          success: true,
          balances: balanceSettledResult.value.balances,
        });
      } else {
        chainBalances.set(balanceChainId, {
          success: false,
          error: new CheckoutError(`Error getting ${chainId} balances`, CheckoutErrorType.GET_BALANCE_ERROR),
          balances: [],
        });
      }
    });
  }

  return chainBalances;
};
