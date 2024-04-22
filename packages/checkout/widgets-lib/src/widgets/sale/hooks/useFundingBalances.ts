import { useRef, useState } from 'react';
import { fetchFundingBalances } from '../functions/fetchFundingBalances';
import { FundingBalance, FundingBalanceResult } from '../types';
import { useSaleContext } from '../context/SaleContextProvider';

export const useFundingBalances = () => {
  const fetching = useRef(false);
  const {
    fromTokenAddress,
    clientConfig,
    provider,
    checkout,
    selectedCurrency,
  } = useSaleContext();
  const [fundingBalances, setFundingBalances] = useState<FundingBalance[]>([]);
  const [fundingBalancesResult, setFundingBalancesResult] = useState<
  FundingBalanceResult[]
  >([]);
  const [loadingBalances, setLoadingBalances] = useState(false);

  const queryFundingBalances = () => {
    if (!fromTokenAddress || !provider || !checkout || !clientConfig) return;

    if (fetching.current) return;

    (async () => {
      fetching.current = true;
      setLoadingBalances(true);
      try {
        const results = await fetchFundingBalances({
          provider,
          checkout,
          currencies: clientConfig.currencies,
          routingOptions: { bridge: false, onRamp: false, swap: true },
          baseCurrency: selectedCurrency,
          getAmountByCurrency: (currency) => clientConfig.currencyConversion?.[
            currency.name
          ]?.amount?.toString(),
          getIsGasless: () => (provider.provider as any)?.isPassport || false,
          onFundingBalance: (foundBalances) => {
            setFundingBalances([...foundBalances]);
          },
        });

        setFundingBalancesResult(results);
      } catch {
        setLoadingBalances(false);
      } finally {
        setLoadingBalances(false);
        fetching.current = false;
      }
    })();
  };

  return {
    fundingBalances,
    loadingBalances,
    fundingBalancesResult,
    queryFundingBalances,
  };
};
