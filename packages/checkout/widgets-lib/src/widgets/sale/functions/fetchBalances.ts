import { Web3Provider } from '@ethersproject/providers';
import {
  Checkout,
  TransactionRequirement,
  GasAmount,
  GasTokenType,
  ItemType,
  SmartCheckoutResult,
  TransactionOrGasType, TokenInfo,
  RoutingOutcomeType,
  ERC20ItemRequirement,
  SmartCheckoutRouter,
} from '@imtbl/checkout-sdk';
import { BigNumber } from 'ethers';
import {
  ClientConfigCurrency,
  ClientConfigCurrencyConversion,
  FundingBalance,
  FundingBalanceType,
  SufficientFundingStep,
} from '../types';

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

const tokenInfo = (req: TransactionRequirement) =>
  (req.current.type !== ItemType.ERC721 && req.current.token) as TokenInfo; // eslint-disable-line

const getSufficientFundingStep = (
  requirement: TransactionRequirement,
): SufficientFundingStep => ({
  type: FundingBalanceType.SUFFICIENT,
  fundingItem: {
    type: ItemType.ERC20,
    token: tokenInfo(requirement),
    fundsRequired: {
      amount: requirement.required.balance,
      formattedAmount: requirement.required.formattedBalance,
    },
    userBalance: {
      balance: requirement.current.balance,
      formattedBalance: requirement.current.formattedBalance,
    },
  },
});

const getAlternativeFundingSteps = (router: SmartCheckoutRouter) => {
  if (router.routingOutcome.type === RoutingOutcomeType.ROUTES_FOUND) {
    const fundingRoutes = router.routingOutcome.fundingRoutes.filter(
      (route) => route.steps.length === 1,
    );

    const fundingSteps = fundingRoutes.flatMap((route) => route.steps.filter(
      (step) =>
          [ItemType.ERC20, ItemType.NATIVE].includes(step.fundingItem.type) // eslint-disable-line
    ));

    return fundingSteps;
  }

  return [];
};

const getFundingBalances = (
  smartCheckoutResult: SmartCheckoutResult,
): FundingBalance[] | null => {
  if (smartCheckoutResult.sufficient === true) {
    const erc20Req = smartCheckoutResult.transactionRequirements.find(
      (req) => req.type === ItemType.ERC20,
    );

    if (erc20Req && erc20Req.type === ItemType.ERC20) {
      return [getSufficientFundingStep(erc20Req)];
    }
  }

  if (smartCheckoutResult.sufficient === false) {
    return getAlternativeFundingSteps(smartCheckoutResult.router);
  }

  return null;
};

const sortFundingBalances = (baseSymbol?: string) => (a: FundingBalance, b: FundingBalance) => {
  const aIsBase = a.fundingItem
      && a.fundingItem.token
      && a.fundingItem.token.symbol === baseSymbol
    ? -1
    : 0;
  const bIsBase = b.fundingItem
      && b.fundingItem.token
      && b.fundingItem.token.symbol === baseSymbol
    ? -1
    : 0;

  if (aIsBase !== bIsBase) {
    return aIsBase - bIsBase;
  }

  if (
    a.type === FundingBalanceType.SUFFICIENT
      && b.type === FundingBalanceType.SUFFICIENT
  ) {
    return 0;
  }
  if (a.type === FundingBalanceType.SUFFICIENT) {
    return -1;
  }
  if (b.type === FundingBalanceType.SUFFICIENT) {
    return 1;
  }

  return 0;
};

const getSortedBalancesList = (currency?: ClientConfigCurrency) => {
  let allBalances: FundingBalance[] = [];

  return (balances: FundingBalance[]) => {
    allBalances = [...balances, ...allBalances].sort(
      sortFundingBalances(currency?.name),
    );

    return allBalances;
  };
};

const digestBalanceResult = (
  onBalanceResult: (balances: FundingBalance[]) => void,
  selectedCurrency: ClientConfigCurrency | undefined,
) => {
  const pushAndSort = getSortedBalancesList(selectedCurrency);

  // TODO: remove later
  const getDeferredBalances = ({
    currency,
    smartCheckoutResult,
  }: BalanceCheckResult) => {
    if (smartCheckoutResult.sufficient && smartCheckoutResult.router) {
      smartCheckoutResult.router?.then((router) => {
        const deferredFundingSteps = getAlternativeFundingSteps(router);

        if (
          Array.isArray(deferredFundingSteps)
          && deferredFundingSteps.length > 0
        ) {
          onBalanceResult(pushAndSort(deferredFundingSteps));
        }
      });
    }
  };

  return (result: BalanceCheckResult) => {
    // TODO: remove later
    getDeferredBalances(result);

    const fundingBalances = getFundingBalances(result.smartCheckoutResult);
    if (Array.isArray(fundingBalances) && fundingBalances.length > 0) {
      onBalanceResult(pushAndSort(fundingBalances));
    }
  };
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
  selectedCurrency: ClientConfigCurrency | undefined,
  onBalancesFound: (balances: FundingBalance[]) => void,
): Promise<BalanceCheckResult[]> => {
  const signer = provider?.getSigner();
  const spenderAddress = (await signer?.getAddress()) || '';

  const gasless = (provider.provider as any)?.isPassport;

  const balancePromises = currencies.map(async (currency) => {
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
      routingOptions: { bridge: false, onRamp: false, swap: true },
    });

    return { currency, smartCheckoutResult };
  });

  const results = await executePromisesInParallel(
    balancePromises,
    digestBalanceResult(onBalancesFound, selectedCurrency),
  );
  return results;
};
