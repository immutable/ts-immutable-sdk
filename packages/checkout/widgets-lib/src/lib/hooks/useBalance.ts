import { useCallback, useState } from 'react';
import { GetBalanceResult } from '@imtbl/checkout-sdk';
import { getTokenBalances } from '../../widgets/wallet/functions/tokenBalances';
import { DEFAULT_BALANCE_RETRY_POLICY } from '../constants';
import { useInterval } from './useInterval';

const REFRESH_BALANCE_INTERVAL_MS = 10000;

export interface RefreshBalancesParams {
  checkout: any;
  provider: any,
  refreshCallback: any;
  errorCallback: any;
}

export const useBalance = ({
  checkout,
  provider,
  refreshCallback,
  errorCallback,
}: RefreshBalancesParams) => {
  const [balancesLoading, setBalancesLoading] = useState(true);

  const refreshBalances = useCallback(async (silent: boolean = false) => {
    console.log('Refresh balances', checkout, provider, `silent: ${silent}`);
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
      const balances: GetBalanceResult[] = await getTokenBalances(checkout, provider, network.chainId);
      if (!silent) {
        setBalancesLoading(false);
      }
      refreshCallback(balances);

      // Ignore errors given that this is a background refresh
      // and the logic will retry anyways.
    } catch (error: any) {
      if (DEFAULT_BALANCE_RETRY_POLICY.nonRetryable!(error)) {
        errorCallback();
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
