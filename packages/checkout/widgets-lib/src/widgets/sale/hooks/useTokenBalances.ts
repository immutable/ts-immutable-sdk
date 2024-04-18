import { RoutingOutcomeType, TokenBalance } from '@imtbl/checkout-sdk';
import { useRef, useState } from 'react';
import { BalanceCheckResult, fetchBalances } from '../functions/fetchBalances';
import { CoinBalance } from '../types';
import { useSaleContext } from '../context/SaleContextProvider';

const transformToCoinBalance = (
  balance: TokenBalance,
  swappable = false,
): CoinBalance => ({ swappable, ...balance });

export const useTokenBalances = () => {
  const {
    fromTokenAddress, clientConfig, provider, checkout,
  } = useSaleContext();
  const [balances, setBalances] = useState<CoinBalance[]>([]);
  const fetching = useRef(false);

  const onBalanceUpdate = ({
    currency,
    smartCheckoutResult,
  }: BalanceCheckResult) => {
    const { sufficient, transactionRequirements } = smartCheckoutResult;
    const erc20Req = transactionRequirements[0];

    // Push to balances if sufficient
    if (sufficient) {
      setBalances((prev) => [
        ...prev,
        transformToCoinBalance(erc20Req.current as TokenBalance, false),
      ]);
    }

    // else, checj if it's swappable, then push to balances
  };

  const getBalances = () => {
    if (!fromTokenAddress || !provider || !checkout || !clientConfig) return;

    if (fetching.current) return;

    (async () => {
      fetching.current = true;
      try {
        await fetchBalances(
          provider,
          checkout,
          clientConfig.currencies,
          clientConfig.currencyConversion,
          onBalanceUpdate,
        );
      } finally {
        fetching.current = false;
      }
    })();
  };

  return [balances, getBalances] as const;
};
