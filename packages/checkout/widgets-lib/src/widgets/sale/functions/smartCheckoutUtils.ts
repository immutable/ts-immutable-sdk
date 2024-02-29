import { Web3Provider } from '@ethersproject/providers';
import {
  Checkout, ERC20ItemRequirement, Fee, FundingRoute,
  FundingStepType, GasAmount, GasTokenType, ItemType, RoutingOutcome, RoutingOutcomeType,
  SmartCheckoutResult, SmartCheckoutSufficient, TokenBalance,
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
): Promise<boolean> => {
  const chainId = getL2ChainId(checkout!.config);
  const balanceResponse = await checkout!.getAllBalances({ provider: provider!, walletAddress, chainId });
  const zero = BigNumber.from('0');

  // check if the user has any funds
  console.count('🐛 check if the user has any funds'); // eslint-disable-line
  if (balanceResponse.balances.length === 0) {
    return true;
  }

  // check if the user has the token used for the purchase
  console.count('🐛 check if the user has the token used for the purchase'); // eslint-disable-line
  const purchaseBalance = balanceResponse.balances.find(
    (balance) => balance.token.address?.toLowerCase() === tokenAddress.toLocaleLowerCase(),
  );

  if (!purchaseBalance) {
    return false;
  }

  // check if the user has enough funds of the token used for the purchase
  console.count('🐛 check if the user has enough funds of the token used for the purchase'); // eslint-disable-line
  const formattedAmount = parseUnits(amount, purchaseBalance.token.decimals);
  if (purchaseBalance.balance.gt(zero) && purchaseBalance.balance.lt(formattedAmount)) {
    return true;
  }

  // if passport, don't check for imx balance as gas is sponsored
  console.count('🐛 if passport, don\'t check for imx balance as gas is sponsored'); // eslint-disable-line
  const isPassport = !!(provider?.provider as any)?.isPassport;
  if (isPassport) {
    return false;
  }

  // check if the user has enough IMX to pay for gas
  console.count('🐛 check if the user has enough IMX to pay for gas'); // eslint-disable-line
  const imxBalance = balanceResponse.balances.find((balance) => balance.token.address === NATIVE);
  const imxBalanceAmount = imxBalance ? imxBalance.balance : BigNumber.from('0');
  if (imxBalanceAmount.gte(zero) && imxBalanceAmount.lt(BigNumber.from(MAX_GAS_LIMIT))) {
    return true;
  }

  // otherwise, the user doesn't have enough funds
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

export const filterSmartCheckoutResult = (
  smartCheckoutResult: SmartCheckoutResult,
  provider?: Web3Provider,
): SmartCheckoutResult => {
  // if the transaction is sufficient or there are no routes found stays as is
  if (smartCheckoutResult.sufficient
    || smartCheckoutResult.router.routingOutcome.type !== RoutingOutcomeType.ROUTES_FOUND) {
    return smartCheckoutResult;
  }

  // if passport wallet and only native balance is insufficient, make
  // as passport transactions are gas sponsored

  const isPassport = !!(provider?.provider as any)?.isPassport;
  const onlyNativeBalanceIsInsufficient = smartCheckoutResult.transactionRequirements.every(
    (req) => (req.type === ItemType.NATIVE ? !req.sufficient : req.sufficient),
  );

  if (isPassport && !smartCheckoutResult.sufficient && onlyNativeBalanceIsInsufficient) {
    return {
      sufficient: true,
      transactionRequirements: smartCheckoutResult.transactionRequirements,
    } as SmartCheckoutSufficient;
  }

  // otherwise, filter out disabled steps
  const stepTypesToFiler = [FundingStepType.SWAP];
  const filteredFundingRoutes = smartCheckoutResult.router.routingOutcome.fundingRoutes
    .filter((route) => !route.steps.some((step) => stepTypesToFiler.includes(step.type)));

  let routingOutcome: RoutingOutcome;
  if (filteredFundingRoutes.length === 0) {
    routingOutcome = {
      type: RoutingOutcomeType.NO_ROUTES_FOUND,
      message: 'Smart Checkout did not find any routes to fulfill the transaction',
    };
  } else {
    routingOutcome = {
      type: RoutingOutcomeType.ROUTES_FOUND,
      fundingRoutes: filteredFundingRoutes,
    };
  }

  const filteredResult = {
    ...smartCheckoutResult,
    router: {
      ...smartCheckoutResult.router,
      routingOutcome,
    },

  };

  return filteredResult;
};
