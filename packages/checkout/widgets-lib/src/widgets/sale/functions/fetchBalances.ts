import { Web3Provider } from '@ethersproject/providers';
import {
  Checkout,
  ERC20ItemRequirement,
  GasAmount,
  GasTokenType,
  ItemType,
  SmartCheckoutResult,
  TransactionOrGasType,
} from '@imtbl/checkout-sdk';
import { BigNumber } from 'ethers';
import { ClientConfigCurrency, ClientConfigCurrencyConversion } from '../types';

export const MAX_GAS_LIMIT = '30000000';

const getItemRequirements = (
  amount: string,
  spenderAddress: string,
  tokenAddress: string,
): ERC20ItemRequirement[] => [
  {
    type: ItemType.ERC20,
    tokenAddress,
    spenderAddress,
    amount,
  },
];

const getGasEstimate = (): GasAmount => ({
  type: TransactionOrGasType.GAS,
  gasToken: {
    type: GasTokenType.NATIVE,
    limit: BigNumber.from(MAX_GAS_LIMIT),
  },
});

const executePromisesInParallel = async <T>(
  awaitedFns: Promise<T>[],
  onResolve: (value: T) => void,
): Promise<T[]> => {
  const runningPromises = awaitedFns.map(async (fn) => {
    const value = await fn;
    onResolve(value);
    return value;
  });

  return await Promise.all(runningPromises);
};

export type BalanceCheckResult = {
  currency: ClientConfigCurrency;
  smartCheckoutResult: SmartCheckoutResult;
};

export const fetchBalances = async (
  provider: Web3Provider,
  checkout: Checkout,
  currencies: ClientConfigCurrency[],
  conversions: ClientConfigCurrencyConversion,
  onResult: (result: BalanceCheckResult) => void,
): Promise<BalanceCheckResult[]> => {
  const signer = provider?.getSigner();
  const spenderAddress = (await signer?.getAddress()) || '';

  const gasless = (provider.provider as any)?.isPassport;

  const balances = currencies.map(async (currency) => {
    const amount = conversions?.[currency.name]?.amount?.toString() || '0';
    const itemRequirements = getItemRequirements(
      amount,
      spenderAddress,
      currency.address,
    );
    const transactionOrGasAmount = gasless ? undefined : getGasEstimate();

    const smartCheckoutResult = await checkout.smartCheckout({
      provider,
      itemRequirements,
      transactionOrGasAmount,
    });

    return { currency, smartCheckoutResult };
  });

  const results = await executePromisesInParallel(balances, onResult);

  return results;
};
