import { Contract, TransactionRequest } from 'ethers';
import { CheckoutError, CheckoutErrorType } from '../../errors';
import {
  ERC1155ItemRequirement, ItemRequirement, ItemType, WrappedBrowserProvider,
} from '../../types';
import { Allowance, InsufficientERC1155, SufficientAllowance } from './types';
import { ERC1155ABI } from '../../env';

// Returns true if the spender address is approved for all ERC1155s of this collection
// Note: ERC1155 only support approvedForAll
export const isERC1155ApprovedForAll = async (
  provider: WrappedBrowserProvider,
  ownerAddress: string,
  contractAddress: string,
  spenderAddress: string,
): Promise<boolean> => {
  try {
    const contract = new Contract(
      contractAddress,
      JSON.stringify(ERC1155ABI),
      provider,
    );
    return await contract.isApprovedForAll(ownerAddress, spenderAddress);
  } catch (err: any) {
    throw new CheckoutError(
      'Failed to check approval for all ERC1155s of collection',
      CheckoutErrorType.GET_ERC1155_ALLOWANCE_ERROR,
      {
        ownerAddress,
        contractAddress,
        spenderAddress,
        error: err,
      },
    );
  }
};

// Returns a populated transaction to setApprovalForAll for the spender against the ERC1155 collection.
export const getSetERC1155ApprovalForAllTransaction = async (
  provider: WrappedBrowserProvider,
  ownerAddress: string,
  contractAddress: string,
  spenderAddress: string,
): Promise<TransactionRequest | undefined> => {
  try {
    const contract = new Contract(
      contractAddress,
      JSON.stringify(ERC1155ABI),
      provider,
    );
    const transaction = await contract.setApprovalForAll.populateTransaction(spenderAddress, true);
    if (transaction) transaction.from = ownerAddress;
    return transaction;
  } catch (err: any) {
    throw new CheckoutError(
      'Failed to get the approval transaction for ERC1155',
      CheckoutErrorType.GET_ERC1155_ALLOWANCE_ERROR,
      {
        contractAddress,
        spenderAddress,
        ownerAddress,
        error: err,
      },
    );
  }
};

export const hasERC1155Allowances = async (
  provider: WrappedBrowserProvider,
  ownerAddress: string,
  itemRequirements: ItemRequirement[],
): Promise<{
  sufficient: boolean,
  allowances: Allowance[]
}> => {
  const erc1155ItemRequirements: ERC1155ItemRequirement[] = itemRequirements.filter(
    (itemRequirement): itemRequirement is ERC1155ItemRequirement => itemRequirement.type === ItemType.ERC1155,
  );

  const allowances = await Promise.all(
    erc1155ItemRequirements.map(async (req) => {
      const collectionIsApproved = await isERC1155ApprovedForAll(
        provider,
        ownerAddress,
        req.contractAddress,
        req.spenderAddress,
      );

      if (collectionIsApproved) {
        return {
          sufficient: true,
          itemRequirement: req,
        } as SufficientAllowance;
      }

      const transaction = await getSetERC1155ApprovalForAllTransaction(
        provider,
        ownerAddress,
        req.contractAddress,
        req.spenderAddress,
      );

      return {
        type: ItemType.ERC1155,
        sufficient: false,
        itemRequirement: req,
        approvalTransaction: transaction,
      } as InsufficientERC1155;
    }),
  );

  return {
    sufficient: allowances.some((allowance) => allowance.sufficient),
    allowances,
  };
};
