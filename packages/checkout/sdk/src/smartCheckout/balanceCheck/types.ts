import {
  BalanceDelta, ERC721Balance, ItemType, TokenBalance,
} from '../../types';

export type BalanceNativeRequirement = {
  type: ItemType.NATIVE,
  sufficient: boolean,
  delta: BalanceDelta,
  current: TokenBalance,
  required: TokenBalance,
  isFee: boolean,
};

export type BalanceERC20Requirement = {
  type: ItemType.ERC20,
  sufficient: boolean,
  delta: BalanceDelta,
  current: TokenBalance,
  required: TokenBalance,
  isFee: boolean,
};

export type BalanceERC721Requirement = {
  type: ItemType.ERC721,
  sufficient: boolean,
  delta: BalanceDelta,
  current: ERC721Balance,
  required: ERC721Balance,
  isFee: boolean,
};

export type BalanceRequirement = BalanceNativeRequirement | BalanceERC721Requirement | BalanceERC20Requirement;

export type BalanceCheckResult = {
  sufficient: boolean,
  balanceRequirements: BalanceRequirement[],
};
