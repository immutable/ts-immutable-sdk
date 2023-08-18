import { TransactionRequest, Web3Provider } from '@ethersproject/providers';
import { BigNumber, Contract } from 'ethers';
import { ERC20ABI, ItemRequirement, ItemType } from '../types';
import { CheckoutError, CheckoutErrorType } from '../errors';

export const getERC20Allowance = async (
  provider: Web3Provider,
  ownerAddress: string,
  contractAddress: string,
  spenderAddress: string,
): Promise<BigNumber> => {
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
      { contractAddress },
    );
  }
};

export const getERC20ApprovalTransaction = async (
  provider: Web3Provider,
  ownerAddress: string,
  contractAddress: string,
  spenderAddress: string,
  amount: BigNumber,
): Promise<TransactionRequest | undefined> => {
  try {
    const contract = new Contract(
      contractAddress,
      JSON.stringify(ERC20ABI),
      provider,
    );
    const approveTransaction = await contract.populateTransaction.approve(spenderAddress, amount);
    if (approveTransaction) approveTransaction.from = ownerAddress;
    return approveTransaction;
  } catch {
    throw new CheckoutError(
      'Failed to get the approval transaction for ERC20',
      CheckoutErrorType.GET_ERC20_ALLOWANCE_ERROR,
      { contractAddress },
    );
  }
};

type SufficientAllowance = {
  sufficient: true,
  itemRequirement: ItemRequirement,
}
| {
  sufficient: false,
  delta: BigNumber,
  itemRequirement: ItemRequirement,
  approvalTransaction: TransactionRequest | undefined,
};

export const hasERC20Allowances = async (
  provider: Web3Provider,
  ownerAddress: string,
  itemRequirements: ItemRequirement[],
): Promise<{
  sufficient: boolean,
  allowances: SufficientAllowance[]
}> => {
  let sufficient = true;
  const sufficientAllowances: SufficientAllowance[] = [];
  const erc20s = new Map<string, ItemRequirement>();
  const allowancePromises = new Map<string, Promise<BigNumber>>();
  const insufficientERC20s = new Map<string, SufficientAllowance>();
  const transactionPromises = new Map<string, Promise<TransactionRequest | undefined>>();

  // Populate maps for both the ERC20 data and promises to get the allowance using the same key
  // so the promise and data can be linked together when the promise resolves
  for (const itemRequirement of itemRequirements) {
    if (itemRequirement.type !== ItemType.ERC20) continue;
    const { contractAddress, spenderAddress } = itemRequirement;
    erc20s.set(`${contractAddress}${spenderAddress}`, itemRequirement);
    allowancePromises.set(
      `${contractAddress}${spenderAddress}`,
      getERC20Allowance(provider, ownerAddress, contractAddress, spenderAddress),
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

    if (allowances[index].gte(itemRequirement.amount)) {
      sufficientAllowances.push({
        sufficient: true,
        itemRequirement,
      });
      continue;
    }

    sufficient = false; // Set sufficient false on the root of the return object when an ERC20 is insufficient
    const { contractAddress, spenderAddress } = itemRequirement;
    const delta = itemRequirement.amount.sub(allowances[index]);
    // Create maps for both the insufficient ERC20 data and the transaction promises using the same key so the results can be merged
    insufficientERC20s.set(
      `${contractAddress}${spenderAddress}`,
      {
        sufficient: false,
        delta,
        itemRequirement,
        approvalTransaction: undefined,
      },
    );
    transactionPromises.set(
      `${contractAddress}${spenderAddress}`,
      getERC20ApprovalTransaction(
        provider,
        ownerAddress,
        contractAddress,
        spenderAddress,
        delta,
      ),
    );
  }

  // Resolves the approval transactions and merges them with the insufficient ERC20 data
  const transactions = await Promise.all(transactionPromises.values());
  const transactionPromiseIds = Array.from(allowancePromises.keys());
  transactions.forEach((transaction, index) => {
    const insufficientERC20 = insufficientERC20s.get(transactionPromiseIds[index]);
    if (!insufficientERC20) return;
    if (insufficientERC20.sufficient) return;
    insufficientERC20.approvalTransaction = transaction;
  });

  // Merge the allowance arrays to get both the sufficient allowances and the insufficient ERC20 allowances
  return { sufficient, allowances: sufficientAllowances.concat(Array.from(insufficientERC20s.values())) };
};
