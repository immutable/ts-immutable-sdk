import {
  TransactionRequirement,
  GasAmount,
  GasTokenType,
  ItemType,
  SmartCheckoutResult,
  TransactionOrGasType,
  TokenInfo,
  RoutingOutcomeType,
  ERC20ItemRequirement,
  SmartCheckoutRouter,
} from '@imtbl/checkout-sdk';
import { BigNumber } from 'ethers';
import {
  ClientConfigCurrency,
  FundingBalance,
  FundingBalanceResult,
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

export const getAlternativeFundingSteps = (router: SmartCheckoutRouter) => {
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

  if (smartCheckoutResult.sufficient === false) {
    return getAlternativeFundingSteps(smartCheckoutResult.router);
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
    currentBalances = [...currentBalances, ...newBalances].sort(
      sortByBaseAndPriority,
    );
    return currentBalances;
  };
};

export const getFnToDigestFundingBalanceResult = (
  onBalanceResult: (balances: FundingBalance[]) => void,
  baseCurrency: ClientConfigCurrency,
): ((result: FundingBalanceResult) => void) => {
  const pushFoundBalances = getFnToPushAndSortFundingBalances(baseCurrency);

  // TODO: remove later
  const getDeferredBalances = ({
    smartCheckoutResult,
  }: FundingBalanceResult) => {
    if (smartCheckoutResult.sufficient && smartCheckoutResult.router) {
      smartCheckoutResult.router?.then((router) => {
        const deferredFundingSteps = getAlternativeFundingSteps(router);
        console.log("🚀 ~ DeferredSmartCheckoutResult:", smartCheckoutResult); // eslint-disable-line

        if (
          Array.isArray(deferredFundingSteps)
          && deferredFundingSteps.length > 0
        ) {
          onBalanceResult(pushFoundBalances(deferredFundingSteps));
        }
      });
    }
  };

  return (result: FundingBalanceResult) => {
    // TODO: remove later
    getDeferredBalances(result);

    const fundingBalances = getFundingBalances(result.smartCheckoutResult);
    if (Array.isArray(fundingBalances) && fundingBalances.length > 0) {
      onBalanceResult(pushFoundBalances(fundingBalances));
    }
  };
};
