import { Web3Provider } from '@ethersproject/providers';
import {
  AvailableRoutingOptions,
  FulfillmentTransaction,
  GasAmount,
  ItemRequirement,
  RoutingOutcome,
  SmartCheckoutResult,
} from '../types/smartCheckout';
import { itemAggregator } from './aggregators';
import { hasERC20Allowances, hasERC721Allowances } from './allowance';
import { balanceCheck } from './balanceCheck';
import { CheckoutConfiguration } from '../config';
import { allowanceAggregator } from './aggregators/allowanceAggregator';
import { gasCalculator } from './gas';
import { getAvailableRoutingOptions } from './routing';
import { routingCalculator } from './routing/routingCalculator';
import { Allowance } from './allowance/types';
import { BalanceCheckResult } from './balanceCheck/types';
import { measureAsyncExecution } from '../logger/debugLogger';

export const smartCheckout = async (
  config: CheckoutConfiguration,
  provider: Web3Provider,
  itemRequirements: ItemRequirement[],
  transactionOrGasAmount: FulfillmentTransaction | GasAmount,
  skipGasCalculation: boolean = false,
): Promise<SmartCheckoutResult> => {
  const ownerAddress = await provider.getSigner().getAddress();

  let aggregatedItems = itemAggregator(itemRequirements);
  const erc20AllowancePromise = hasERC20Allowances(
    provider,
    ownerAddress,
    aggregatedItems,
  );
  const erc721AllowancePromise = hasERC721Allowances(
    provider,
    ownerAddress,
    aggregatedItems,
  );

  const resolvedAllowances = await measureAsyncExecution<
  { sufficient: boolean; allowances: Allowance[] }[]
  >(
    config,
    'Time to calculate token allowances',
    Promise.all([erc20AllowancePromise, erc721AllowancePromise]),
  );

  const aggregatedAllowances = allowanceAggregator(
    resolvedAllowances[0],
    resolvedAllowances[1],
  );

  let gasItem = null;
  if (!skipGasCalculation) {
    gasItem = await measureAsyncExecution<ItemRequirement | null>(
      config,
      'Time to run gas calculator',
      gasCalculator(provider, aggregatedAllowances, transactionOrGasAmount),
    );
    if (gasItem !== null) {
      aggregatedItems.push(gasItem);
      aggregatedItems = itemAggregator(aggregatedItems);
    }
  }

  const balanceCheckResult = await measureAsyncExecution<BalanceCheckResult>(
    config,
    'Time to run balance checks',
    balanceCheck(config, provider, ownerAddress, aggregatedItems, true),
  );

  const { sufficient } = balanceCheckResult;
  const transactionRequirements = balanceCheckResult.balanceRequirements;

  if (sufficient) {
    return {
      sufficient,
      transactionRequirements,
    };
  }

  const availableRoutingOptions = await measureAsyncExecution<AvailableRoutingOptions>(
    config,
    'Time to fetch available routing options',
    getAvailableRoutingOptions(config, provider),
  );

  const routingOutcome = await measureAsyncExecution<RoutingOutcome>(
    config,
    'Total time to run the routing calculator',
    routingCalculator(
      config,
      ownerAddress,
      balanceCheckResult,
      availableRoutingOptions,
    ),
  );

  return {
    sufficient,
    transactionRequirements,
    router: {
      availableRoutingOptions,
      routingOutcome,
    },
  };
};
