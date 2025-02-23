import { useCallback, useState } from 'react';
import { Checkout, GetBalanceResult, WrappedBrowserProvider } from '@imtbl/checkout-sdk';
import { getTokenBalances } from '../../widgets/wallet/functions/tokenBalances';
import { DEFAULT_BALANCE_RETRY_POLICY } from '../constants';
import { useInterval } from './useInterval';

const REFRESH_BALANCE_INTERVAL_MS = 30000; // 30 seconds -- keep app less chatty

export interface UseBalanceParams {
  checkout: Checkout | undefined;
  provider: WrappedBrowserProvider | undefined,
  refreshCallback: (balance: GetBalanceResult[]) => void;
  errorCallback: (error: Error) => void;
}

export const useBalance = ({
  checkout,
  provider,
  refreshCallback,
  errorCallback,
}: UseBalanceParams) => {
  const [balancesLoading, setBalancesLoading] = useState(true);

  const refreshBalances = useCallback(async (
    // If silent is true, the balances will not be set to loading
    silent: boolean = false,
  ) => {
    if (!checkout || !provider) return;
    try {
      const network = await checkout.getNetworkInfo({
        provider,
      });

      /* If the provider's network is not supported, return out of this and let the
      connect loader handle the switch network functionality */
      if (!network.isSupported) {
        return;
      }

      if (!silent) {
        setBalancesLoading(true);
      }
      const balances: GetBalanceResult[] = await getTokenBalances(checkout, provider, Number(network.chainId));
      if (!silent) {
        setBalancesLoading(false);
      }
      refreshCallback(balances);

      // Ignore errors given that this is a background refresh
      // and the logic will retry anyways.
    } catch (error: any) {
      if (DEFAULT_BALANCE_RETRY_POLICY.nonRetryable!(error)) {
        errorCallback(error);
      }
      if (!silent) {
        setBalancesLoading(false);
      }
    }
  }, [checkout, provider]);

  useInterval(() => refreshBalances(true), REFRESH_BALANCE_INTERVAL_MS);

  return {
    balancesLoading,
    refreshBalances,
  };
};
