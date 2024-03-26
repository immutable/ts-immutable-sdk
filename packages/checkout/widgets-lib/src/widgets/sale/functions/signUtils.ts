import { BigNumber, ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';

import { SignedTransaction } from '../types';

export const filterAllowedTransactions = async (
  transactions: SignedTransaction[],
  provider: Web3Provider,
): Promise<SignedTransaction[]> => {
  try {
    const signer = provider.getSigner();
    const signerAddress = await signer.getAddress();
    const approveTxn = transactions.find((txn) => txn.methodCall.startsWith('approve'));

    if (!approveTxn || !signer || !signerAddress) {
      return transactions;
    }

    const contract = new ethers.Contract(
      approveTxn.tokenAddress,
      ['function allowance(address,address) view returns (uint256)'],
      signer,
    );

    const allowance = await signer?.call({
      to: approveTxn.tokenAddress,
      data: contract.interface.encodeFunctionData('allowance', [
        signerAddress,
        approveTxn.params.spender,
      ]),
    });

    const currentAmount = BigNumber.from(allowance);
    const desiredAmount = approveTxn.params.amount ? BigNumber.from(approveTxn.params.amount) : BigNumber.from(0);

    const isAllowed = currentAmount.gte(BigNumber.from('0')) && currentAmount.gte(desiredAmount);

    if (isAllowed) {
      return transactions.filter((txn) => txn.methodCall !== approveTxn.methodCall);
    }
  } catch {
    /* Ignoring errors, as we don't need block wallet from
     * sending the approve when it's not possible to check the allowance
     */
  }

  return transactions;
};
