import { Web3Provider } from '@ethersproject/providers';
import {
  FulfilmentTransaction,
  GasAmount,
  ItemRequirement, SmartCheckoutResult, TransactionRequirement,
} from '../types/smartCheckout';
import { itemAggregator } from './aggregators';
import {
  hasERC20Allowances,
  hasERC721Allowances,
} from './allowance';
import { balanceCheck } from './balanceCheck';
import { CheckoutConfiguration } from '../config';
import { allowanceAggregator } from './aggregators/allowanceAggregator';
import { gasCalculator } from './gas';
import { BalanceCheckResult } from './balanceCheck/types';
// import { routingOptionsAvailable } from './routing';
// import { routingCalculator } from './routing/routingCalculator';

export const getSmartCheckoutResult = (
  balanceCheckResult: BalanceCheckResult,
): SmartCheckoutResult => {
  let sufficient = true;
  const transactionRequirements: TransactionRequirement[] = [];

  for (const balance of balanceCheckResult.balanceRequirements) {
    if (!balance.sufficient) sufficient = false;

    transactionRequirements.push({
      type: balance.type,
      sufficient: balance.sufficient,
      required: balance.required,
      current: balance.current,
      delta: balance.delta,
    });
  }

  return {
    sufficient,
    transactionRequirements,
  };
};

export const smartCheckout = async (
  config: CheckoutConfiguration,
  provider: Web3Provider,
  itemRequirements: ItemRequirement[],
  transactionOrGasAmount: FulfilmentTransaction | GasAmount,
): Promise<SmartCheckoutResult> => {
  const ownerAddress = await provider.getSigner().getAddress();
  let aggregatedItems = itemAggregator(itemRequirements);
  const erc20Allowances = await hasERC20Allowances(provider, ownerAddress, aggregatedItems);
  const erc721Allowances = await hasERC721Allowances(provider, ownerAddress, aggregatedItems);

  const aggregatedAllowances = allowanceAggregator(erc20Allowances, erc721Allowances);

  const gasItem = await gasCalculator(provider, aggregatedAllowances, transactionOrGasAmount);
  if (gasItem !== null) {
    aggregatedItems.push(gasItem);
    aggregatedItems = itemAggregator(aggregatedItems);
  }

  const balanceRequirements = await balanceCheck(config, provider, ownerAddress, aggregatedItems);

  // Determine which services are available
  // const availableRoutingOptions = await routingOptionsAvailable(config, provider);
  // const fundingRoutes = await routingCalculator(balanceRequirements, availableRoutingOptions);

  return getSmartCheckoutResult(balanceRequirements);
};
