import { useContext, useRef, useState } from 'react';
import { TransactionRequirement } from '@imtbl/checkout-sdk';
import { CryptoFiatContext } from 'context/crypto-fiat-context/CryptoFiatContext';
import { fetchFundingBalances } from '../functions/fetchFundingBalances';
import { FundingBalance, FundingBalanceResult } from '../types';
import { useSaleContext } from '../context/SaleContextProvider';
import { getPricingBySymbol } from '../utils/pricing';

export const useFundingBalances = () => {
  const fetching = useRef(false);
  const {
    fromTokenAddress,
    clientConfig,
    provider,
    checkout,
    selectedCurrency,
  } = useSaleContext();
  const { cryptoFiatState } = useContext(CryptoFiatContext);
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
          getAmountByCurrency: (currency) => {
            const pricing = getPricingBySymbol(currency.name, clientConfig.totalAmount, cryptoFiatState.conversions);
            return pricing ? pricing.amount.toString() : '';
          },
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
