import { BigNumber } from 'ethers';
import { ItemType, TokenInfo } from '../../types';

export type BalanceDelta = {
  balance: BigNumber;
  formattedBalance: string;
};

export type BalanceTokenResult = {
  balance: BigNumber;
  formattedBalance: string;
  token: TokenInfo;
};

export interface BalanceERC721Result {
  balance: BigNumber;
  formattedBalance: string;
  contractAddress: string;
  id: string;
}

export type BalanceResult = BalanceERC721Result | BalanceTokenResult;

export type BalanceNativeRequirement = {
  type: ItemType.NATIVE,
  sufficient: boolean,
  delta: BalanceDelta,
  current: BalanceTokenResult,
  required: BalanceTokenResult,
};

export type BalanceERC20Requirement = {
  type: ItemType.ERC20,
  sufficient: boolean,
  delta: BalanceDelta,
  current: BalanceTokenResult,
  required: BalanceTokenResult,
};

export type BalanceERC721Requirement = {
  type: ItemType.ERC721,
  sufficient: boolean,
  delta: BalanceDelta,
  current: BalanceERC721Result,
  required: BalanceERC721Result,
};

export type BalanceRequirement = BalanceNativeRequirement | BalanceERC721Requirement | BalanceERC20Requirement;

export type BalanceCheckSufficient = {
  sufficient: true,
  itemRequirements: BalanceRequirement[],
};

export type BalanceCheckInsufficient = {
  sufficient: false,
  itemRequirements: BalanceRequirement[],
};

export type BalanceCheckResult = BalanceCheckSufficient | BalanceCheckInsufficient;
