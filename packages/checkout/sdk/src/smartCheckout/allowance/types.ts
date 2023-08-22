import { TransactionRequest } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { ItemRequirement, ItemType } from '../../types';

export type SufficientAllowance = {
  sufficient: true,
  itemRequirement: ItemRequirement,
}
| {
  type: ItemType.ERC20,
  sufficient: false,
  delta: BigNumber,
  itemRequirement: ItemRequirement,
  approvalTransaction: TransactionRequest | undefined,
}
| {
  type: ItemType.ERC721,
  sufficient: false,
  itemRequirement: ItemRequirement,
  approvalTransaction: TransactionRequest | undefined,
};
