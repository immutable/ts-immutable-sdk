import {
  TransactionRequirement,
  GasAmount,
  GasTokenType,
  ItemType,
  SmartCheckoutResult,
  TransactionOrGasType,
  TokenInfo,
  ERC20ItemRequirement,
  FundingRoute,
  RoutingOutcomeType,
} from '@imtbl/checkout-sdk';
import { BigNumber } from 'ethers';
import {
  ClientConfigCurrency,
  FundingBalance,
  FundingBalanceType,
  SufficientFundingStep,
} from '../types';

const MAX_GAS_LIMIT = '30000000';

export const getERC20ItemRequirement = (
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

export const getGasEstimate = (): GasAmount => ({
  type: TransactionOrGasType.GAS,
  gasToken: {
    type: GasTokenType.NATIVE,
    limit: BigNumber.from(MAX_GAS_LIMIT),
  },
});

export const wrapPromisesWithOnResolve = async <T>(
  awaitedFns: Promise<T>[],
  onResolve: (value: T) => void,
): Promise<T[]> => {
  const promises = awaitedFns.map(async (fn) => {
    const value = await fn;
    onResolve(value);
    return value;
  });

  return await Promise.all(promises);
};

export const tokenInfo = (req: TransactionRequirement) =>
    (req.current.type !== ItemType.ERC721 && req.current.token) as TokenInfo; // eslint-disable-line

export const getSufficientFundingStep = (
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

export const getAlternativeFundingSteps = (fundingRoutes: FundingRoute[]) => {
  if (fundingRoutes.length === 0) {
    return [];
  }

  const routes = fundingRoutes.filter((route) => route.steps.length === 1);

  const tokens = [ItemType.ERC20, ItemType.NATIVE];
  const steps = routes.flatMap((route) => route.steps.filter((step) => tokens.includes(step.fundingItem.type)));

  return steps;
};

export const getFundingBalances = (
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

  if (
    smartCheckoutResult.sufficient === false
      && smartCheckoutResult?.router?.routingOutcome.type
        === RoutingOutcomeType.ROUTES_FOUND
  ) {
    return getAlternativeFundingSteps(
      smartCheckoutResult.router.routingOutcome.fundingRoutes,
    );
  }

  return null;
};

export const getFnToSortFundingBalancesByPriority = (baseSymbol?: string) => (a: FundingBalance, b: FundingBalance) => {
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

export const getFnToPushAndSortFundingBalances = (
  baseCurrency: ClientConfigCurrency,
): ((balances: FundingBalance[]) => FundingBalance[]) => {
  let currentBalances: FundingBalance[] = [];
  const sortByBaseAndPriority = getFnToSortFundingBalancesByPriority(
    baseCurrency.name,
  );

  return (newBalances: FundingBalance[]) => {
    if (newBalances.length === 0) {
      return currentBalances;
    }

    currentBalances = Array.from(
      new Set([...currentBalances, ...newBalances]),
    ).sort(sortByBaseAndPriority);

    return currentBalances;
  };
};
