import { useRef, useState } from 'react';
import { BalanceCheckResult, fetchBalances } from '../functions/fetchBalances';
import { FundingBalance } from '../types';
import { useSaleContext } from '../context/SaleContextProvider';

export const useTokenBalances = () => {
  const {
    fromTokenAddress, clientConfig, provider, checkout,
    selectedCurrency,
  } = useSaleContext();
  const [balances, setBalances] = useState<FundingBalance[]>([]);
  const [balancesResult, setBalancesResult] = useState<BalanceCheckResult[]>([]);
  const fetching = useRef(false);
  const [loadingBalances, setLoadingBalances] = useState(false);

  const queryBalances = () => {
    if (!fromTokenAddress || !provider || !checkout || !clientConfig) return;

    if (fetching.current) return;

    (async () => {
      fetching.current = true;
      setLoadingBalances(true);
      try {
        const results = await fetchBalances(
          provider,
          checkout,
          clientConfig.currencies,
          clientConfig.currencyConversion,
          selectedCurrency,
          (foundBalances) => {
            setBalances([...foundBalances]);
          },
        );

        setBalancesResult(results);
      } catch {
        setLoadingBalances(false);
      } finally {
        setLoadingBalances(false);
        fetching.current = false;
      }
    })();
  };


  return {
    balances, queryBalances, loadingBalances, balancesResult,
  };
};
