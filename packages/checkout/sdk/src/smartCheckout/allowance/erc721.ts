import { Contract, TransactionRequest } from 'ethers';
import { CheckoutError, CheckoutErrorType } from '../../errors';
import { ItemRequirement, ItemType, WrappedBrowserProvider } from '../../types';
import { Allowance, InsufficientERC721 } from './types';
import { ERC721ABI } from '../../env';

// Returns true if the spender address is approved for all ERC721s of this collection
export const getERC721ApprovedForAll = async (
  provider: WrappedBrowserProvider,
  ownerAddress: string,
  contractAddress: string,
  spenderAddress: string,
): Promise<boolean> => {
  try {
    const contract = new Contract(
      contractAddress,
      JSON.stringify(ERC721ABI),
      provider,
    );
    return await contract.isApprovedForAll(ownerAddress, spenderAddress);
  } catch (err: any) {
    throw new CheckoutError(
      'Failed to check approval for all ERC721s of collection',
      CheckoutErrorType.GET_ERC721_ALLOWANCE_ERROR,
      {
        ownerAddress,
        contractAddress,
        spenderAddress,
        error: err,
      },
    );
  }
};

// Returns a populated transaction to approve the ERC721 for the spender.
export const getApproveTransaction = async (
  provider: WrappedBrowserProvider,
  ownerAddress: string,
  contractAddress: string,
  spenderAddress: string,
  id: bigint,
): Promise<TransactionRequest | undefined> => {
  try {
    const contract = new Contract(
      contractAddress,
      JSON.stringify(ERC721ABI),
      provider,
    );
    const transaction = await contract.approve.populateTransaction(spenderAddress, id);
    if (transaction) transaction.from = ownerAddress;
    return transaction;
  } catch (err: any) {
    throw new CheckoutError(
      'Failed to get the approval transaction for ERC721',
      CheckoutErrorType.GET_ERC721_ALLOWANCE_ERROR,
      {
        id: id.toString(),
        contractAddress,
        spenderAddress,
        ownerAddress,
        error: err,
      },
    );
  }
};

// Returns the address that is approved for the ERC721.
// This is sufficient when the spender is the approved address
export const getERC721ApprovedAddress = async (
  provider: WrappedBrowserProvider,
  contractAddress: string,
  id: bigint,
): Promise<string> => {
  try {
    const contract = new Contract(
      contractAddress,
      JSON.stringify(ERC721ABI),
      provider,
    );
    return await contract.getApproved(id);
  } catch (err: any) {
    throw new CheckoutError(
      'Failed to get approved address for ERC721',
      CheckoutErrorType.GET_ERC721_ALLOWANCE_ERROR,
      {
        id: id.toString(),
        contractAddress,
        error: err,
      },
    );
  }
};

export const convertIdToNumber = (id: string, contractAddress: string): bigint => {
  try {
    return BigInt(id);
  } catch (err: any) {
    throw new CheckoutError(
      'Invalid ERC721 ID',
      CheckoutErrorType.GET_ERC721_ALLOWANCE_ERROR,
      { id, contractAddress },
    );
  }
};

export const getApprovedCollections = async (
  provider: WrappedBrowserProvider,
  itemRequirements: ItemRequirement[],
  owner: string,
): Promise<Map<string, boolean>> => {
  const approvedCollections = new Map<string, boolean>();
  const approvedForAllPromises = new Map<string, Promise<boolean>>();

  for (const itemRequirement of itemRequirements) {
    if (itemRequirement.type !== ItemType.ERC721) continue;
    const { contractAddress, spenderAddress } = itemRequirement;
    const key = `${contractAddress}-${spenderAddress}`;
    approvedCollections.set(key, false);
    if (approvedForAllPromises.has(key)) continue;
    approvedForAllPromises.set(key, getERC721ApprovedForAll(
      provider,
      owner,
      contractAddress,
      spenderAddress,
    ));
  }

  const approvals = await Promise.all(approvedForAllPromises.values());
  const keys = Array.from(approvedForAllPromises.keys());
  approvals.forEach((approval, index) => {
    approvedCollections.set(keys[index], approval);
  });

  return approvedCollections;
};

export const hasERC721Allowances = async (
  provider: WrappedBrowserProvider,
  ownerAddress: string,
  itemRequirements: ItemRequirement[],
): Promise<{
  sufficient: boolean,
  allowances: Allowance[]
}> => {
  let sufficient = true;
  const sufficientAllowances: Allowance[] = [];

  // Setup maps to be able to link data back to the associated promises
  const erc721s = new Map<string, ItemRequirement>();
  const approvedAddressPromises = new Map<string, Promise<string>>();
  const insufficientERC721s = new Map<string, InsufficientERC721>();
  const transactionPromises = new Map<string, Promise<TransactionRequest | undefined>>();

  // Check if there are any collections with approvals for all ERC721s for a given spender
  const approvedCollections = await getApprovedCollections(
    provider,
    itemRequirements,
    ownerAddress,
  );

  // Populate maps for both the ERC721 data and promises to get the approved addresses using the same key
  // so the promise and data can be linked together when the promise is resolved
  for (const itemRequirement of itemRequirements) {
    if (itemRequirement.type !== ItemType.ERC721) continue;

    const { contractAddress, id, spenderAddress } = itemRequirement;

    // If the collection is approved for all then just set the item requirements and sufficient true
    const approvedForAllKey = `${contractAddress}-${spenderAddress}`;
    const approvedForAll = approvedCollections.get(approvedForAllKey);
    if (approvedForAll) {
      sufficientAllowances.push({
        sufficient: true,
        itemRequirement,
      });
      continue;
    }

    // If collection not approved for all then check if the given ERC721 is approved for the spender
    const key = `${contractAddress}-${id}`;
    const convertedId = convertIdToNumber(id, contractAddress);
    erc721s.set(key, itemRequirement);
    approvedAddressPromises.set(
      key,
      getERC721ApprovedAddress(provider, contractAddress, convertedId),
    );
  }

  const approvedAddresses = await Promise.all(approvedAddressPromises.values());
  const approvedAddressPromiseIds = Array.from(approvedAddressPromises.keys());

  // Iterate through the approved address promises and get the ERC721 data from the ERC721 map
  // If the approved address returned for that ERC721 is for the spender then just set the item requirements and sufficient true
  // If the approved address does not match the spender then return the approval transaction
  for (let index = 0; index < approvedAddresses.length; index++) {
    const itemRequirement = erc721s.get(approvedAddressPromiseIds[index]);
    if (!itemRequirement || itemRequirement.type !== ItemType.ERC721) continue;

    if (approvedAddresses[index] === itemRequirement.spenderAddress) {
      sufficientAllowances.push({
        sufficient: true,
        itemRequirement,
      });
      continue;
    }

    sufficient = false; // Set sufficient false on the root of the return object when an ERC721 is insufficient

    const { contractAddress, id, spenderAddress } = itemRequirement;
    const key = `${contractAddress}-${id}`;
    const convertedId = convertIdToNumber(id, contractAddress);
    // Create maps for both the insufficient ERC721 data and the transaction promises using the same key so the results can be merged
    insufficientERC721s.set(
      key,
      {
        type: ItemType.ERC721,
        sufficient: false,
        itemRequirement,
        approvalTransaction: undefined,
      },
    );
    transactionPromises.set(
      key,
      getApproveTransaction(
        provider,
        ownerAddress,
        contractAddress,
        spenderAddress,
        convertedId,
      ),
    );
  }

  // Resolves the approval transactions and merges them with the insufficient ERC721 data
  const transactions = await Promise.all(transactionPromises.values());
  const transactionPromiseIds = Array.from(transactionPromises.keys());
  transactions.forEach((transaction, index) => {
    const insufficientERC721 = insufficientERC721s.get(transactionPromiseIds[index]);
    if (!insufficientERC721) return;
    if (insufficientERC721.sufficient) return;
    insufficientERC721.approvalTransaction = transaction;
  });

  // Merge the allowance arrays to get both the sufficient allowances and the insufficient ERC721 allowances
  return { sufficient, allowances: sufficientAllowances.concat(Array.from(insufficientERC721s.values())) };
};
