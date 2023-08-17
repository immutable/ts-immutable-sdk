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
  const allowances: SufficientAllowance[] = [];

  for (const itemRequirement of itemRequirements) {
    if (itemRequirement.type !== ItemType.ERC20) continue;

    const { contractAddress, spenderAddress } = itemRequirement;

    // eslint-disable-next-line no-await-in-loop
    const allowance = await getERC20Allowance(provider, ownerAddress, contractAddress, spenderAddress);
    if (allowance.gte(itemRequirement.amount)) {
      allowances.push({
        sufficient: true,
        itemRequirement,
      });
      continue;
    }

    sufficient = false;
    allowances.push({
      sufficient: false,
      delta: itemRequirement.amount.sub(allowance),
      itemRequirement,
      // eslint-disable-next-line no-await-in-loop
      approvalTransaction: await getERC20ApprovalTransaction(
        provider,
        ownerAddress,
        itemRequirement.contractAddress,
        itemRequirement.spenderAddress,
        itemRequirement.amount,
      ),
    });
  }

  return {
    sufficient,
    allowances,
  };
};
