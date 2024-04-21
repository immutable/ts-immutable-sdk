import {
  FundingStepType,
  ItemType,
  RoutingOutcomeType,
  TokenInfo,
} from '@imtbl/checkout-sdk';
import { useRef, useState } from 'react';
import { BalanceCheckResult, fetchBalances } from '../functions/fetchBalances';
import { FundingBalance, FundingBalanceType } from '../types';
import { useSaleContext } from '../context/SaleContextProvider';

const FUNDING_ROUTES_ALLOWLIST = [
  FundingStepType.SWAP,
  FundingStepType.ONRAMP,
  FundingStepType.BRIDGE,
];

export const useTokenBalances = () => {
  const {
    fromTokenAddress, clientConfig, provider, checkout,
  } = useSaleContext();
  const [balances, setBalances] = useState<FundingBalance[]>([]);
  const [balancesResult, setBalancesResult] = useState<BalanceCheckResult[]>([]);
  const fetching = useRef(false);
  const [loadingBalances, setLoadingBalances] = useState(false);

  const onProgress = ({
    // currency,
    smartCheckoutResult,
  }: BalanceCheckResult) => {
    console.log('🚀 ~ smartCheckoutResult:', smartCheckoutResult);

    if (smartCheckoutResult.sufficient) {
      smartCheckoutResult.router?.then((router) => {
        if (
          router.routingOutcome.type
            === RoutingOutcomeType.ROUTES_FOUND
        ) {
          // filter funding routes with more than 1 step
          const routes = router.routingOutcome.fundingRoutes.filter(
            (route) => route.steps.length === 1 && FUNDING_ROUTES_ALLOWLIST.includes(route.steps[0].type),
          );

          // extract all funding items with ERC20
          const steps = routes.flatMap(
            (route) => route.steps.filter((step) => [ItemType.ERC20, ItemType.NATIVE].includes(step.fundingItem.type)),
          );

          // push to balances
          steps.forEach((fundingStep) => {
            console.log('🚀 ~ fundingStep:', fundingStep.type);

            setBalances((prev) => [...prev, { ...fundingStep }]);
          });
        }
      });
    }

    if (smartCheckoutResult.sufficient) {
      const erc20Req = smartCheckoutResult.transactionRequirements[0];
      // Push to balances if sufficient
      console.log('🚀 ~ erc20Req:', erc20Req);

      // get sufficient funding item
      setBalances((prev) => [
        ...prev,
        {
          type: FundingBalanceType.SUFFICIENT,
          fundingItem: {
            type: ItemType.ERC20,
            token: (erc20Req.current.type !== ItemType.ERC721
              && erc20Req.current.token) as TokenInfo,
            fundsRequired: {
              amount: erc20Req.required.balance,
              formattedAmount: erc20Req.required.formattedBalance,
            },
            userBalance: {
              balance: erc20Req.current.balance,
              formattedBalance: erc20Req.current.formattedBalance,
            },
          },
        },
      ]);
    }

    // else, check if it's swappable, then push to balances

    if (
      !smartCheckoutResult.sufficient
      && smartCheckoutResult.router.routingOutcome.type
        === RoutingOutcomeType.ROUTES_FOUND
    ) {
      // filter funding routes with more than 1 step
      const singleStepRoutes = smartCheckoutResult.router.routingOutcome.fundingRoutes.filter(
        (route) => route.steps.length === 1 && FUNDING_ROUTES_ALLOWLIST.includes(route.steps[0].type),
      );

      // extract all funding items with ERC20
      const fundingSteps = singleStepRoutes.flatMap(
        (route) => route.steps.filter((step) => [ItemType.ERC20, ItemType.NATIVE].includes(step.fundingItem.type)),
      );

      // push to balances
      fundingSteps.forEach((fundingStep) => {
        console.log('🚀 ~ fundingStep:', fundingStep.type);

        setBalances((prev) => [...prev, { ...fundingStep }]);
      });
    }
  };

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
          onProgress,
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
