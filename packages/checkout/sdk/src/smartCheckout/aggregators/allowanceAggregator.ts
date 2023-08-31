import { InsufficientERC20, InsufficientERC721, ItemAllowance } from '../allowance/types';

export const allowanceAggregator = (
  erc20allowances: ItemAllowance,
  erc721allowances: ItemAllowance,
): (InsufficientERC20 | InsufficientERC721)[] => {
  const aggregatedAllowances: (InsufficientERC20 | InsufficientERC721)[] = [];
  if (!erc20allowances.sufficient) {
    for (const allowance of erc20allowances.allowances) {
      if (!allowance.sufficient) aggregatedAllowances.push(allowance);
    }
  }
  if (!erc721allowances.sufficient) {
    for (const allowance of erc721allowances.allowances) {
      if (!allowance.sufficient) aggregatedAllowances.push(allowance);
    }
  }
  return aggregatedAllowances;
};
