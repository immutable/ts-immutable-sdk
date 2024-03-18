import { Web3Provider } from '@ethersproject/providers';
import {
  ERC20ItemRequirement,
  Fee,
  FundingRoute,
  FundingStepType,
  GasAmount,
  GasTokenType,
  ItemType,
  RoutingOutcome,
  RoutingOutcomeType,
  SmartCheckoutResult, TokenBalance,
  TransactionOrGasType,
} from '@imtbl/checkout-sdk';
import { BigNumber } from 'ethers';
import { calculateCryptoToFiat, formatFiatString } from '../../../lib/utils';

export const MAX_GAS_LIMIT = '30000000';

export const getItemRequirements = (amount: string, spenderAddress: string, tokenAddress: string)
: ERC20ItemRequirement[] => [
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

export const fundingRouteFees = (
  fundingRoute: FundingRoute,
  conversions: Map<string, number>,
) => {
  const fees: Fee[] = [];

  for (const step of fundingRoute.steps) {
    switch (step.type) {
      case FundingStepType.BRIDGE:
        fees.push(step.fees.approvalGasFee);
        fees.push(...step.fees.bridgeFees);
        fees.push(step.fees.bridgeGasFee);
        break;
      case FundingStepType.SWAP:
        fees.push(step.fees.approvalGasFee);
        fees.push(...step.fees.swapFees);
        fees.push(step.fees.swapGasFee);
        break;
      default:
    }
  }

  let totalUsd: number = 0;
  for (const fee of fees) {
    if (fee.token) {
      const feeUsd = calculateCryptoToFiat(fee.formattedAmount, fee.token.symbol, conversions);
      totalUsd += parseFloat(feeUsd);
    }
  }
  return formatFiatString(totalUsd);
};

export const smartCheckoutTokensList = (
  smartCheckoutResult: SmartCheckoutResult,
) => {
  if (smartCheckoutResult.sufficient
    || smartCheckoutResult.router.routingOutcome.type !== RoutingOutcomeType.ROUTES_FOUND) {
    return [];
  }

  const tokenSymbols: string[] = [];
  for (const requirement of smartCheckoutResult.transactionRequirements) {
    const { token } = (requirement.current as TokenBalance);
    if (!tokenSymbols.includes(token.symbol)) {
      tokenSymbols.push(token.symbol);
    }
  }
  for (const fundingRoute of smartCheckoutResult.router.routingOutcome.fundingRoutes) {
    for (const step of fundingRoute.steps) {
      if (!tokenSymbols.includes(step.fundingItem.token.symbol)) {
        tokenSymbols.push(step.fundingItem.token.symbol);
      }
    }
  }
  return tokenSymbols;
};

export const filterSmartCheckoutResult = (
  smartCheckoutResult: SmartCheckoutResult,
  provider?: Web3Provider,
): SmartCheckoutResult => {
  // if passport wallet gas requirements are always sufficient
  const isPassport = !!(provider?.provider as any)?.isPassport;
  const transactionRequirements = isPassport
    ? smartCheckoutResult.transactionRequirements.map((req) => {
      if (req.type === ItemType.NATIVE) {
        return { ...req, sufficient: true };
      }
      return req;
    })
    : smartCheckoutResult.transactionRequirements;

  // if the transaction is sufficient, no need to filter
  if (
    smartCheckoutResult.sufficient
    || smartCheckoutResult.router.routingOutcome.type
      !== RoutingOutcomeType.ROUTES_FOUND
  ) {
    return {
      ...smartCheckoutResult,
      transactionRequirements,
    };
  }

  // otherwise, filter disabled steps
  const stepTypesToFiler = [
    // FundingStepType.SWAP,
    // FundingStepType.ONRAMP,
    // FundingStepType.BRIDGE,
  ] as FundingStepType[];
  const filteredFundingRoutes = smartCheckoutResult.router.routingOutcome.fundingRoutes.filter(
    (route) => !route.steps.some((step) => stepTypesToFiler.includes(step.type)),
  );

  let routingOutcome: RoutingOutcome;
  if (filteredFundingRoutes.length === 0) {
    routingOutcome = {
      type: RoutingOutcomeType.NO_ROUTES_FOUND,
      message:
        'Smart Checkout did not find any routes to fulfill the transaction',
    };
  } else {
    routingOutcome = {
      type: RoutingOutcomeType.ROUTES_FOUND,
      fundingRoutes: filteredFundingRoutes,
    };
  }

  const filteredResult = {
    ...smartCheckoutResult,
    transactionRequirements,
    router: {
      ...smartCheckoutResult.router,
      routingOutcome,
    },
  };

  return filteredResult;
};

export const getFractionalBalance = (
  smartCheckoutResult?: SmartCheckoutResult,
): Record<ItemType, boolean> | undefined => {
  if (!smartCheckoutResult) return undefined;

  return smartCheckoutResult.transactionRequirements.reduce(
    (acc, req) => ({
      ...acc,
      [req.type]: req.sufficient,
    }),
    {} as Record<ItemType, boolean>,
  );
};
