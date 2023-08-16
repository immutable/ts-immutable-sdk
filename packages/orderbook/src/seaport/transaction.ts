import { TransactionMethods } from '@opensea/seaport-js/lib/types';
import { TransactionBuilder } from 'types';

// Add 20% more gas than estimate to prevent out of gas errors
// This can always be overwritten by the user signing the transaction
export function prepareTransaction(
  transactionMethods: TransactionMethods,
): TransactionBuilder {
  return async () => {
    const transaction = await transactionMethods.buildTransaction();
    transaction.gasLimit = await transactionMethods.estimateGas();
    transaction.gasLimit = transaction.gasLimit
      .add(transaction.gasLimit.div(5));

    return transaction;
  };
}
