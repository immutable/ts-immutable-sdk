import { BigNumber } from 'ethers';
import { ItemRequirement, ItemType } from '../../types';

export const nativeBalanceAggregator = (
  itemRequirements: ItemRequirement[],
): ItemRequirement[] => {
  const aggregatedMap = new Map<string, ItemRequirement>();
  const aggregatedItemRequirements: ItemRequirement[] = [];

  itemRequirements.forEach((itemRequirement) => {
    const { type } = itemRequirement;

    if (type !== ItemType.NATIVE) {
      aggregatedItemRequirements.push(itemRequirement);
      return;
    }

    const { amount } = itemRequirement;

    const aggregateItem = aggregatedMap.get(type);
    if (aggregateItem && aggregateItem.type === ItemType.NATIVE) {
      aggregateItem.amount = BigNumber.from(aggregateItem.amount).add(amount);
    } else {
      aggregatedMap.set(type, { ...itemRequirement });
    }
  });

  return aggregatedItemRequirements.concat(Array.from(aggregatedMap.values()));
};

export const erc20BalanceAggregator = (
  itemRequirements: ItemRequirement[],
): ItemRequirement[] => {
  const aggregatedMap = new Map<string, ItemRequirement>();
  const aggregatedItemRequirements: ItemRequirement[] = [];

  itemRequirements.forEach((itemRequirement) => {
    const { type } = itemRequirement;

    if (type !== ItemType.ERC20) {
      aggregatedItemRequirements.push(itemRequirement);
      return;
    }

    const { contractAddress, amount } = itemRequirement;
    const key = `${contractAddress}`;
    const aggregateItem = aggregatedMap.get(key);
    if (aggregateItem && aggregateItem.type === ItemType.ERC20) {
      aggregateItem.amount = BigNumber.from(aggregateItem.amount).add(amount);
    } else {
      aggregatedMap.set(key, { ...itemRequirement });
    }
  });

  return aggregatedItemRequirements.concat(Array.from(aggregatedMap.values()));
};

export const erc721BalanceAggregator = (
  itemRequirements: ItemRequirement[],
): ItemRequirement[] => {
  const aggregatedMap = new Map<string, ItemRequirement>();
  const aggregatedItemRequirements: ItemRequirement[] = [];

  itemRequirements.forEach((itemRequirement) => {
    const { type } = itemRequirement;

    if (type !== ItemType.ERC721) {
      aggregatedItemRequirements.push(itemRequirement);
      return;
    }

    const { contractAddress, id } = itemRequirement;
    const key = `${contractAddress}${id}`;
    const aggregateItem = aggregatedMap.get(key);
    if (!aggregateItem) aggregatedMap.set(key, { ...itemRequirement });
  });

  return aggregatedItemRequirements.concat(Array.from(aggregatedMap.values()));
};

export const balanceAggregator = (
  itemRequirements: ItemRequirement[],
): ItemRequirement[] => erc721BalanceAggregator(erc20BalanceAggregator(nativeBalanceAggregator(itemRequirements)));
