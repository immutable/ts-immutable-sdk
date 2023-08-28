import { Web3Provider } from '@ethersproject/providers';
import {
  FulfilmentTransaction,
  GasAmount,
  ItemRequirement, ItemType, SmartCheckoutResult, TransactionRequirement, TransactionRequirementType,
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

export const getSmartCheckoutResult = (
  balanceCheckResult: BalanceCheckResult,
): SmartCheckoutResult => {
  let sufficient = true;
  const transactionRequirements: TransactionRequirement[] = [];

  for (const balance of balanceCheckResult.balanceRequirements) {
    if (!balance.sufficient) sufficient = false;

    let type;
    switch (balance.type) {
      case ItemType.ERC20:
        type = TransactionRequirementType.ERC20;
        break;
      case ItemType.ERC721:
        type = TransactionRequirementType.ERC721;
        break;
      default:
        type = TransactionRequirementType.NATIVE;
        break;
    }

    transactionRequirements.push({
      type,
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

  return getSmartCheckoutResult(balanceRequirements);
};
