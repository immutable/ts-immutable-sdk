import { ItemRequirement, ItemType } from '../../types';

export const nativeAggregator = (
  itemRequirements: ItemRequirement[],
): ItemRequirement[] => {
  const aggregatedMap = new Map<string, ItemRequirement>();
  const aggregatedItemRequirements: ItemRequirement[] = [];

  itemRequirements.forEach((item) => {
    const { type } = item;

    if (type !== ItemType.NATIVE || item.isFee) {
      aggregatedItemRequirements.push(item);
      return;
    }

    const itemRequirement = {
      ...item,
      isFee: 'isFee' in item ? item.isFee : false,
    };

    const { amount } = itemRequirement;

    const aggregateItem = aggregatedMap.get(type);
    if (aggregateItem && aggregateItem.type === ItemType.NATIVE) {
      aggregateItem.amount = aggregateItem.amount + amount;
    } else {
      aggregatedMap.set(type, { ...itemRequirement });
    }
  });

  return aggregatedItemRequirements.concat(Array.from(aggregatedMap.values()));
};

export const erc20ItemAggregator = (
  itemRequirements: ItemRequirement[],
): ItemRequirement[] => {
  const aggregatedMap = new Map<string, ItemRequirement>();
  const aggregatedItemRequirements: ItemRequirement[] = [];

  itemRequirements.forEach((item) => {
    const { type } = item;

    if (type !== ItemType.ERC20 || item.isFee) {
      aggregatedItemRequirements.push(item);
      return;
    }

    const itemRequirement = {
      ...item,
      isFee: 'isFee' in item ? item.isFee : false,
    };

    const { tokenAddress, spenderAddress, amount } = itemRequirement;
    const key = `${tokenAddress}${spenderAddress}`;
    const aggregateItem = aggregatedMap.get(key);
    if (aggregateItem && aggregateItem.type === ItemType.ERC20) {
      aggregateItem.amount = aggregateItem.amount + amount;
    } else {
      aggregatedMap.set(key, { ...itemRequirement });
    }
  });

  return aggregatedItemRequirements.concat(Array.from(aggregatedMap.values()));
};

export const erc721ItemAggregator = (
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

    const { contractAddress, spenderAddress, id } = itemRequirement;
    const key = `${contractAddress}${spenderAddress}${id}`;
    const aggregateItem = aggregatedMap.get(key);
    if (!aggregateItem) aggregatedMap.set(key, { ...itemRequirement });
  });

  return aggregatedItemRequirements.concat(Array.from(aggregatedMap.values()));
};

export const erc1155ItemAggregator = (
  itemRequirements: ItemRequirement[],
): ItemRequirement[] => {
  const aggregatedMap = new Map<string, ItemRequirement>();
  const aggregatedItemRequirements: ItemRequirement[] = [];

  itemRequirements.forEach((itemRequirement) => {
    const { type } = itemRequirement;

    if (type !== ItemType.ERC1155) {
      aggregatedItemRequirements.push(itemRequirement);
      return;
    }

    const {
      contractAddress, spenderAddress, id, amount,
    } = itemRequirement;
    const key = `${contractAddress}${spenderAddress}${id}`;
    const aggregateItem = aggregatedMap.get(key);
    if (aggregateItem && aggregateItem.type === ItemType.ERC1155) {
      aggregateItem.amount = aggregateItem.amount + amount
    } else {
      aggregatedMap.set(key, { ...itemRequirement });
    }
  });

  return aggregatedItemRequirements.concat(Array.from(aggregatedMap.values()));
};

export const itemAggregator = (
  itemRequirements: ItemRequirement[],
  // eslint-disable-next-line max-len
): ItemRequirement[] => erc1155ItemAggregator(erc721ItemAggregator(erc20ItemAggregator(nativeAggregator(itemRequirements))));
