import { BrowserProvider, Contract } from 'ethers';

import { SignedTransaction } from '../types';

export const filterAllowedTransactions = async (
  transactions: SignedTransaction[],
  provider: BrowserProvider,
): Promise<SignedTransaction[]> => {
  try {
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();
    const approveTxn = transactions.find((txn) => txn.methodCall.startsWith('approve'));

    if (!approveTxn || !signer || !signerAddress) {
      return transactions;
    }

    const contract = new Contract(
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

    const currentAmount = BigInt(allowance);
    const desiredAmount = approveTxn.params.amount ? BigInt(approveTxn.params.amount) : BigInt(0);

    const isAllowed = currentAmount >= BigInt('0') && currentAmount >= (desiredAmount);

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
