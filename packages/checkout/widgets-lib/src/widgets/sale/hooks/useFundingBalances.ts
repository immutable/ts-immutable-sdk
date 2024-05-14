import { useRef, useState } from 'react';
import { TransactionRequirement } from '@imtbl/checkout-sdk';
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
  const [transactionRequirement, setTransactionRequirement] = useState<
  TransactionRequirement | undefined
  >();
  const [fundingBalances, setFundingBalances] = useState<FundingBalance[]>([]);
  const [fundingBalancesResult, setFundingBalancesResult] = useState<
  FundingBalanceResult[]
  >([]);
  const [loadingBalances, setLoadingBalances] = useState(false);

  const queryFundingBalances = () => {
    if (
      !fromTokenAddress
      || !provider
      || !checkout
      || !clientConfig
      || !selectedCurrency
    ) return;

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
            currency.name.toUpperCase()
          ]?.amount?.toString(),
          getIsGasless: () => (provider.provider as any)?.isPassport || false,
          onFundingBalance: (foundBalances) => {
            setFundingBalances([...foundBalances]);
          },
          onComplete: () => {
            setLoadingBalances(false);
          },
          onFundingRequirement: (requirement) => {
            setTransactionRequirement(requirement);
          },
        });

        setFundingBalancesResult(results);
      } catch {
        setLoadingBalances(false);
      } finally {
        fetching.current = false;
      }
    })();
  };

  return {
    fundingBalances,
    loadingBalances,
    fundingBalancesResult,
    transactionRequirement,
    queryFundingBalances,
  };
};
