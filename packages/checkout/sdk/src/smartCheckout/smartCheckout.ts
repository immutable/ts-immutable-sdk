import {
  AvailableRoutingOptions,
  FulfillmentTransaction,
  FundingRoute,
  GasAmount,
  ItemRequirement,
  ItemType,
  RoutingOutcome,
  SmartCheckoutResult,
} from '../types/smartCheckout';
import { itemAggregator } from './aggregators';
import { hasERC1155Allowances, hasERC20Allowances, hasERC721Allowances } from './allowance';
import { balanceCheck } from './balanceCheck';
import { CheckoutConfiguration } from '../config';
import { allowanceAggregator } from './aggregators/allowanceAggregator';
import { gasCalculator } from './gas';
import { getAvailableRoutingOptions } from './routing';
import { routingCalculator } from './routing/routingCalculator';
import { Allowance } from './allowance/types';
import { BalanceCheckResult, BalanceRequirement } from './balanceCheck/types';
import { measureAsyncExecution } from '../logger/debugLogger';
import { WrappedBrowserProvider } from '../types';

export const overrideBalanceCheckResult = (
  balanceCheckResult: BalanceCheckResult,
): BalanceCheckResult => {
  const modifiedRequirements = balanceCheckResult.balanceRequirements.map(
    (requirement) => {
      if (requirement.type === ItemType.ERC20 && requirement.sufficient) {
        return {
          ...requirement,
          sufficient: false,
          delta: {
            balance: requirement.required.balance,
            formattedBalance: requirement.required.formattedBalance,
          },
        };
      }
      return requirement;
    },
  );

  return {
    sufficient: false,
    balanceRequirements: modifiedRequirements,
  };
};

const processRoutes = async (
  config: CheckoutConfiguration,
  ownerAddress: string,
  sufficient: boolean,
  availableRoutingOptions: AvailableRoutingOptions,
  transactionRequirements: BalanceRequirement[],
  balanceCheckResult: BalanceCheckResult,
  fundingRouteFullAmount: boolean,
  onComplete?: (result: SmartCheckoutResult) => void,
  onFundingRoute?: (fundingRoute: FundingRoute) => void,
): Promise<RoutingOutcome> => {
  const finalBalanceCheckResult = !fundingRouteFullAmount || (sufficient && onComplete)
    ? overrideBalanceCheckResult(balanceCheckResult)
    : balanceCheckResult;

  const routingOutcome = await measureAsyncExecution<RoutingOutcome>(
    config,
    'Total time to run the routing calculator',
    routingCalculator(
      config,
      ownerAddress,
      finalBalanceCheckResult,
      availableRoutingOptions,
      onFundingRoute,
    ),
  );

  onComplete?.({
    sufficient,
    transactionRequirements,
    router: {
      availableRoutingOptions,
      routingOutcome,
    },
  });

  return routingOutcome;
};

export const smartCheckout = async (
  config: CheckoutConfiguration,
  provider: WrappedBrowserProvider,
  itemRequirements: ItemRequirement[],
  transactionOrGasAmount?: FulfillmentTransaction | GasAmount,
  routingOptions?: AvailableRoutingOptions,
  onComplete?: (result: SmartCheckoutResult) => void,
  onFundingRoute?: (fundingRoute: FundingRoute) => void,
  fundingRouteFullAmount: boolean = false,
): Promise<SmartCheckoutResult> => {
  const ownerAddress = await (await provider.getSigner()).getAddress();

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
  const erc1155AllowancePromise = hasERC1155Allowances(
    provider,
    ownerAddress,
    aggregatedItems,
  );

  const resolvedAllowances = await measureAsyncExecution<
  { sufficient: boolean; allowances: Allowance[] }[]
  >(
    config,
    'Time to calculate token allowances',
    Promise.all([erc20AllowancePromise, erc721AllowancePromise, erc1155AllowancePromise]),
  );

  const aggregatedAllowances = allowanceAggregator(
    resolvedAllowances[0],
    resolvedAllowances[1],
    resolvedAllowances[2],
  );

  // Skip gas calculation if transactionOrGasAmount is not provided
  let gasItem = null;
  if (transactionOrGasAmount) {
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

  const availableRoutingOptions = await measureAsyncExecution<AvailableRoutingOptions>(
    config,
    'Time to fetch available routing options',
    getAvailableRoutingOptions(config, provider),
  );
  if (routingOptions?.onRamp === false) availableRoutingOptions.onRamp = false;
  if (routingOptions?.swap === false) availableRoutingOptions.swap = false;
  if (routingOptions?.bridge === false) availableRoutingOptions.bridge = false;

  if (onComplete) {
    processRoutes(
      config,
      ownerAddress,
      sufficient,
      availableRoutingOptions,
      transactionRequirements,
      balanceCheckResult,
      fundingRouteFullAmount,
      onComplete,
      onFundingRoute,
    );
    return {
      sufficient,
      transactionRequirements,
    };
  }

  if (sufficient) {
    return {
      sufficient,
      transactionRequirements,
    };
  }

  const routingOutcome = await processRoutes(
    config,
    ownerAddress,
    sufficient,
    availableRoutingOptions,
    transactionRequirements,
    balanceCheckResult,
    fundingRouteFullAmount,
    onComplete,
    onFundingRoute,
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
