import { BigNumber } from 'ethers';
import { ItemRequirement, ItemType } from '../types';

export const erc20ItemAggregator = (
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

    const { contractAddress, spenderAddress, amount } = itemRequirement;
    const key = `${contractAddress}${spenderAddress}`;
    const aggregateItem = aggregatedMap.get(key);
    if (aggregateItem && aggregateItem.type === ItemType.ERC20) {
      aggregateItem.amount = BigNumber.from(aggregateItem.amount).add(amount);
    } else {
      aggregatedMap.set(key, { ...itemRequirement });
    }
  });

  return aggregatedItemRequirements.concat(Array.from(aggregatedMap.values()));
};

export const itemAggregator = (
  itemRequirements: ItemRequirement[],
): ItemRequirement[] => erc20ItemAggregator(itemRequirements);
