import { Web3Provider } from '@ethersproject/providers';
import {
  Checkout, ERC20ItemRequirement, Fee, FundingRoute,
  FundingStepType, GasAmount, GasTokenType, ItemType, RoutingOutcome, RoutingOutcomeType,
  SmartCheckoutResult, TokenBalance,
  TransactionOrGasType,
} from '@imtbl/checkout-sdk';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { getL2ChainId, NATIVE } from '../../../lib';
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

export const isUserFractionalBalanceBlocked = async (
  walletAddress: string,
  tokenAddress: string,
  amount: string,
  checkout?: Checkout,
  provider?: Web3Provider,
) => {
  const chainId = getL2ChainId(checkout!.config);
  const balanceResponse = await checkout!.getAllBalances({ provider: provider!, walletAddress, chainId });
  const zero = BigNumber.from('0');

  const purchaseBalance = balanceResponse.balances.find((balance) => balance.token.address === tokenAddress);
  if (!purchaseBalance) {
    return false;
  }
  const formattedAmount = parseUnits(amount, purchaseBalance.token.decimals);

  if (purchaseBalance.balance.gt(zero) && purchaseBalance.balance.lt(formattedAmount)) {
    return true;
  }

  const isPassport = !!(provider?.provider as any)?.isPassport;
  if (isPassport) {
    return false;
  }
  const imxBalance = balanceResponse.balances.find((balance) => balance.token.address === NATIVE);
  const imxBalanceAmount = imxBalance ? imxBalance.balance : BigNumber.from('0');
  if (imxBalanceAmount.gte(zero) && imxBalanceAmount.lt(BigNumber.from(MAX_GAS_LIMIT))) {
    return true;
  }
  return false;
};

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

export const filterSmartCheckoutResult = (smartCheckoutResult: SmartCheckoutResult): SmartCheckoutResult => {
  if (smartCheckoutResult.sufficient
    || smartCheckoutResult.router.routingOutcome.type !== RoutingOutcomeType.ROUTES_FOUND) {
    return smartCheckoutResult;
  }

  const filteredFundingRoutes = smartCheckoutResult.router.routingOutcome.fundingRoutes
    .filter((route) => !route.steps.some((step) => step.type !== FundingStepType.SWAP));

  let routingOutcome: RoutingOutcome;
  if (filteredFundingRoutes.length === 0) {
    routingOutcome = {
      type: RoutingOutcomeType.NO_ROUTES_FOUND,
      message: 'Smart Checkout did not find any Swap routes to fulfill the transaction',
    };
  } else {
    routingOutcome = {
      type: RoutingOutcomeType.ROUTES_FOUND,
      fundingRoutes: filteredFundingRoutes,
    };
  }
  return {
    ...smartCheckoutResult,
    router: {
      ...smartCheckoutResult.router,
      routingOutcome,
    },
  };
};
