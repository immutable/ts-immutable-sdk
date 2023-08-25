import { TransactionRequest } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import {
  ERC20Item, ERC721Item, ItemRequirement, ItemType,
} from '../../types';

export type ItemAllowance = {
  sufficient: boolean,
  allowances: Allowance[],
};

export type Allowance = SufficientAllowance | InsufficientERC20 | InsufficientERC721;

export type SufficientAllowance = {
  sufficient: true,
  itemRequirement: ItemRequirement,
};

export type InsufficientERC20 = {
  type: ItemType.ERC20,
  sufficient: false,
  delta: BigNumber,
  itemRequirement: ERC20Item,
  approvalTransaction: TransactionRequest | undefined,
};

export type InsufficientERC721 = {
  type: ItemType.ERC721,
  sufficient: false,
  itemRequirement: ERC721Item,
  approvalTransaction: TransactionRequest | undefined,
};
