import { BrowserProvider, Contract, TransactionRequest } from 'ethers';
import { CheckoutError, CheckoutErrorType } from '../../errors';
import { ItemRequirement, ItemType } from '../../types';
import { Allowance, InsufficientERC20 } from './types';
import { ERC20ABI } from '../../env';

// Gets the amount an address has allowed to be spent by the spender for the ERC20.
export const getERC20Allowance = async (
  provider: BrowserProvider,
  ownerAddress: string,
  contractAddress: string,
  spenderAddress: string,
): Promise<bigint> => {
  try {
    const contract = new Contract(
      contractAddress,
      JSON.stringify(ERC20ABI),
      provider,
    );
    return await contract.allowance(ownerAddress, spenderAddress);
  } catch (err: any) {
    throw new CheckoutError(
      'Failed to get the allowance for ERC20',
      CheckoutErrorType.GET_ERC20_ALLOWANCE_ERROR,
      { contractAddress, error: err },
    );
  }
};

// Returns the approval transaction for the ERC20 that the owner can sign
// to approve the spender spending the provided amount of ERC20.
export const getERC20ApprovalTransaction = async (
  provider: BrowserProvider,
  ownerAddress: string,
  contractAddress: string,
  spenderAddress: string,
  amount: bigint,
): Promise<TransactionRequest | undefined> => {
  try {
    const contract = new Contract(
      contractAddress,
      JSON.stringify(ERC20ABI),
      provider,
    );
    const approveTransaction = await contract.approve.populateTransaction(spenderAddress, amount);
    if (approveTransaction) approveTransaction.from = ownerAddress;
    return approveTransaction;
  } catch (err: any) {
    throw new CheckoutError(
      'Failed to get the approval transaction for ERC20',
      CheckoutErrorType.GET_ERC20_ALLOWANCE_ERROR,
      { contractAddress, error: err },
    );
  }
};

export const hasERC20Allowances = async (
  provider: BrowserProvider,
  ownerAddress: string,
  itemRequirements: ItemRequirement[],
): Promise<{
  sufficient: boolean,
  allowances: Allowance[]
}> => {
  let sufficient = true;
  const sufficientAllowances: Allowance[] = [];
  const erc20s = new Map<string, ItemRequirement>();
  const allowancePromises = new Map<string, Promise<bigint>>();
  const insufficientERC20s = new Map<string, InsufficientERC20>();
  const transactionPromises = new Map<string, Promise<TransactionRequest | undefined>>();

  // Populate maps for both the ERC20 data and promises to get the allowance using the same key
  // so the promise and data can be linked together when the promise resolves
  for (const itemRequirement of itemRequirements) {
    if (itemRequirement.type !== ItemType.ERC20) continue;
    const { tokenAddress, spenderAddress } = itemRequirement;
    const key = `${tokenAddress}${spenderAddress}`;
    erc20s.set(key, itemRequirement);
    allowancePromises.set(
      key,
      getERC20Allowance(provider, ownerAddress, tokenAddress, spenderAddress),
    );
  }

  const allowances = await Promise.all(allowancePromises.values());
  const allowancePromiseIds = Array.from(allowancePromises.keys());

  // Iterate through the allowance promises and get the ERC20 data from the ERC20 map
  // If the allowance returned for that ERC20 is sufficient then just set the item requirements
  // If the allowance is insufficient then set the delta and a promise for the approval transaction
  for (let index = 0; index < allowances.length; index++) {
    const itemRequirement = erc20s.get(allowancePromiseIds[index]);
    if (!itemRequirement || itemRequirement.type !== ItemType.ERC20) continue;

    if (allowances[index] >= itemRequirement.amount) {
      sufficientAllowances.push({
        sufficient: true,
        itemRequirement,
      });
      continue;
    }

    sufficient = false; // Set sufficient false on the root of the return object when an ERC20 is insufficient
    const { tokenAddress, spenderAddress } = itemRequirement;
    const key = `${tokenAddress}${spenderAddress}`;
    const delta = itemRequirement.amount - allowances[index];
    // Create maps for both the insufficient ERC20 data and the transaction promises using the same key so the results can be merged
    insufficientERC20s.set(
      key,
      {
        type: ItemType.ERC20,
        sufficient: false,
        delta,
        itemRequirement,
        approvalTransaction: undefined,
      },
    );
    transactionPromises.set(
      key,
      getERC20ApprovalTransaction(
        provider,
        ownerAddress,
        tokenAddress,
        spenderAddress,
        delta,
      ),
    );
  }

  // Resolves the approval transactions and merges them with the insufficient ERC20 data
  const transactions = await Promise.all(transactionPromises.values());
  const transactionPromiseIds = Array.from(transactionPromises.keys());
  transactions.forEach((transaction, index) => {
    const insufficientERC20 = insufficientERC20s.get(transactionPromiseIds[index]);
    if (!insufficientERC20) return;
    if (insufficientERC20.sufficient) return;
    insufficientERC20.approvalTransaction = transaction;
  });

  // Merge the allowance arrays to get both the sufficient allowances and the insufficient ERC20 allowances
  return { sufficient, allowances: sufficientAllowances.concat(Array.from(insufficientERC20s.values())) };
};
