import { ApprovalAction } from '@opensea/seaport-js/lib/types';
import { PopulatedTransaction } from 'ethers';

export async function prepareApprovalTransaction(
  approvalAction: ApprovalAction,
): Promise<PopulatedTransaction> {
  const approvalTransaction = await approvalAction.transactionMethods.buildTransaction();
  approvalTransaction.gasLimit = await approvalAction.transactionMethods.estimateGas();
  // Add 20% more gas than estimate to prevent out of gas errors
  // This can always be overwritten by the user signing the transaction
  approvalTransaction.gasLimit = approvalTransaction.gasLimit
    .add(approvalTransaction.gasLimit.div(5));

  return approvalTransaction;
}
