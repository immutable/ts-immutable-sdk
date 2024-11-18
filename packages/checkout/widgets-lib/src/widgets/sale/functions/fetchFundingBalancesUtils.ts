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
  FundingStep,
  FundingStepType,
  Fee,
  SwapFees,
  NamedBrowserProvider,
} from '@imtbl/checkout-sdk';

import { Environment } from '@imtbl/config';
import { getTokenImageByAddress, isNativeToken } from '../../../lib/utils';
import { isGasFree } from '../../../lib/provider';
import {
  OrderQuoteCurrency,
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
    limit: BigInt(MAX_GAS_LIMIT),
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

const getTokenInfoFromRequirement = (req: TransactionRequirement) =>
  (req.current.type !== ItemType.ERC721 && req.current.token) as TokenInfo; // eslint-disable-line

const getTokenInfo = (
  tokenInfo: TokenInfo,
  environment: Environment,
): TokenInfo => {
  const address = isNativeToken(tokenInfo.address)
    ? tokenInfo.symbol
    : tokenInfo.address ?? '';

  return {
    ...tokenInfo,
    icon: tokenInfo.icon ?? getTokenImageByAddress(environment, address),
  };
};

export const getSufficientFundingStep = (
  requirement: TransactionRequirement,
  environment: Environment,
): SufficientFundingStep => ({
  type: FundingBalanceType.SUFFICIENT,
  fundingItem: {
    type: ItemType.ERC20,
    token: getTokenInfo(getTokenInfoFromRequirement(requirement), environment),
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

export const getAlternativeFundingSteps = (
  fundingRoutes: FundingRoute[],
  environment: Environment,
): FundingStep[] => {
  if (fundingRoutes.length === 0) {
    return [];
  }

  const routes = fundingRoutes.filter((route) => route.steps.length === 1);

  const tokens = [ItemType.ERC20, ItemType.NATIVE];
  const steps = routes.flatMap((route) => route.steps.filter((step) => tokens.includes(step.fundingItem.type)));

  return steps.map((step) => ({
    ...step,
    fundingItem: {
      ...step.fundingItem,
      token: getTokenInfo(step.fundingItem.token, environment),
    },
  }));
};

export const getFundingBalances = (
  smartCheckoutResult: SmartCheckoutResult,
  environment: Environment,
): FundingBalance[] | null => {
  if (smartCheckoutResult.sufficient === true) {
    const erc20Req = smartCheckoutResult.transactionRequirements.find(
      (req) => req.type === ItemType.ERC20,
    );

    if (erc20Req && erc20Req.type === ItemType.ERC20) {
      return [getSufficientFundingStep(erc20Req, environment)];
    }
  }

  if (
    smartCheckoutResult.sufficient === false
    && smartCheckoutResult?.router?.routingOutcome.type
   === RoutingOutcomeType.ROUTES_FOUND
  ) {
    return getAlternativeFundingSteps(
      smartCheckoutResult.router.routingOutcome.fundingRoutes,
      environment,
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
  baseCurrency: OrderQuoteCurrency,
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

const getZeroFee = (fee: Fee): Fee => ({
  ...fee,
  amount: BigInt(0),
  formattedAmount: '0',
});

const getGasFreeBalanceAdjustment = (
  balance: FundingBalance,
  provider?: NamedBrowserProvider,
): FundingBalance => {
  if (balance.type !== FundingStepType.SWAP) {
    return balance;
  }

  if (!isGasFree(provider)) {
    return balance;
  }

  const adjustedFees: SwapFees = {
    ...balance.fees,
    approvalGasFee: getZeroFee(balance.fees.approvalGasFee),
    swapGasFee: getZeroFee(balance.fees.swapGasFee),
  };

  return {
    ...balance,
    fees: adjustedFees,
  };
};

export const processGasFreeBalances = (
  balances: FundingBalance[],
  provider?: NamedBrowserProvider,
) => balances.map((balance) => getGasFreeBalanceAdjustment(balance, provider));
