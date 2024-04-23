import { Web3Provider } from '@ethersproject/providers';
import { Checkout } from '@imtbl/checkout-sdk';
import {
  ClientConfigCurrency,
  FundingBalance,
  FundingBalanceResult,
} from '../types';
import {
  getAlternativeFundingSteps,
  getERC20ItemRequirement,
  getFnToPushAndSortFundingBalances,
  getFundingBalances,
  getGasEstimate,
  wrapPromisesWithOnResolve,
} from './fetchFundingBalancesUtils';

export type FundingBalanceParams = {
  provider: Web3Provider;
  checkout: Checkout;
  currencies: ClientConfigCurrency[];
  baseCurrency: ClientConfigCurrency;
  routingOptions: { bridge: boolean; onRamp: boolean; swap: boolean };
  getAmountByCurrency: (currency: ClientConfigCurrency) => string;
  getIsGasless: () => boolean;
  onFundingBalance: (balances: FundingBalance[]) => void;
  onComplete?: (balances: FundingBalance[]) => void;
};

export const fetchFundingBalances = async (
  params: FundingBalanceParams,
): Promise<FundingBalanceResult[]> => {
  const {
    provider,
    checkout,
    currencies,
    onFundingBalance,
    getAmountByCurrency,
    baseCurrency,
    getIsGasless,
    onComplete,
  } = params;

  const signer = provider?.getSigner();
  const spenderAddress = (await signer?.getAddress()) || '';

  const pushToFoundBalances = getFnToPushAndSortFundingBalances(baseCurrency);
  const updateFundingBalances = (balances: FundingBalance[] | null) => {
    if (Array.isArray(balances) && balances.length > 0) {
      onFundingBalance(pushToFoundBalances(balances));
    }
  };

  const balancePromises = currencies.map(async (currency) => {
    const amount = getAmountByCurrency(currency) || '0';
    const itemRequirements = getERC20ItemRequirement(
      amount,
      spenderAddress,
      currency.address,
    );

    const transactionOrGasAmount = getIsGasless()
      ? undefined
      : getGasEstimate();

    const smartCheckoutResult = await checkout.smartCheckout({
      provider,
      itemRequirements,
      transactionOrGasAmount,
      routingOptions: { bridge: false, onRamp: false, swap: true },
      onComplete: () => {
        onComplete?.(pushToFoundBalances([]));
      },
      onFundingRoute: (route) => {
        updateFundingBalances(getAlternativeFundingSteps([route]));
      },
    });

    return { currency, smartCheckoutResult };
  });

  const results = await wrapPromisesWithOnResolve(
    balancePromises,
    ({ smartCheckoutResult }) => {
      updateFundingBalances(getFundingBalances(smartCheckoutResult));
    },
  );

  return results;
};
