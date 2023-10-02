import { Web3Provider } from '@ethersproject/providers';
import {
  FulfillmentTransaction,
  GasAmount,
  ItemRequirement,
  SmartCheckoutResult,
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
import { getAvailableRoutingOptions } from './routing';
import { routingCalculator } from './routing/routingCalculator';

export const smartCheckout = async (
  config: CheckoutConfiguration,
  provider: Web3Provider,
  itemRequirements: ItemRequirement[],
  transactionOrGasAmount: FulfillmentTransaction | GasAmount,
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

  const balanceCheckResult = await balanceCheck(config, provider, ownerAddress, aggregatedItems);
  const { sufficient } = balanceCheckResult;
  const transactionRequirements = balanceCheckResult.balanceRequirements;

  if (sufficient) {
    return {
      sufficient,
      transactionRequirements,
    };
  }

  const availableRoutingOptions = await getAvailableRoutingOptions(config, provider);
  const routingOutcome = await routingCalculator(
    config,
    ownerAddress,
    balanceCheckResult,
    availableRoutingOptions,
  );

  const isPassport = (provider.provider as any)?.isPassport || false;
  return {
    sufficient,
    transactionRequirements,
    router: {
      isPassport,
      availableRoutingOptions,
      routingOutcome,
    },
  };
};
