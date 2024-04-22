import { Web3Provider } from '@ethersproject/providers';
import { Checkout } from '@imtbl/checkout-sdk';
import {
  ClientConfigCurrency,
  FundingBalance,
  FundingBalanceResult,
} from '../types';
import {
  getERC20ItemRequirement,
  getFnToDigestFundingBalanceResult,
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
  } = params;

  const signer = provider?.getSigner();
  const spenderAddress = (await signer?.getAddress()) || '';

  const balancePromises = currencies.map(async (currency) => {
    // const amount = conversions?.[currency.name]?.amount?.toString() || '0';
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
    });

    return { currency, smartCheckoutResult };
  });

  const onFundingBalanceResult = getFnToDigestFundingBalanceResult(
    onFundingBalance,
    baseCurrency,
  );

  const results = await wrapPromisesWithOnResolve(
    balancePromises,
    onFundingBalanceResult,
  );

  console.log('🚀 ~ FundingBalanceResults:', results); // eslint-disable-line

  return results;
};
