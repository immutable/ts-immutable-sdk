import { Web3Provider } from '@ethersproject/providers';
import { CheckoutError, CheckoutErrorType } from '../../errors';
import { UnsignedTransactions } from '../../types';

export const executeTransactions = async (
  provider: Web3Provider,
  unsignedTransactions: UnsignedTransactions,
) => {
  if (unsignedTransactions.approvalTransactions.length > 0) {
    try {
      const approvalTransactions = [];
      for (const approvalTransaction of unsignedTransactions.approvalTransactions) {
        approvalTransactions.push(provider.getSigner().sendTransaction(approvalTransaction));
      }
      await Promise.all(approvalTransactions);
    } catch (err: any) {
      throw new CheckoutError(
        'An error occurred while executing the approval transaction',
        CheckoutErrorType.EXECUTE_TRANSACTIONS_ERROR,
        {
          message: err.message,
        },
      );
    }
  }
  if (unsignedTransactions.fulfilmentTransactions.length > 0) {
    try {
      const fulfilmentTransactions = [];
      for (const fulfilmentTransaction of unsignedTransactions.fulfilmentTransactions) {
        fulfilmentTransactions.push(provider.getSigner().sendTransaction(fulfilmentTransaction));
      }
      await Promise.all(fulfilmentTransactions);
    } catch (err: any) {
      throw new CheckoutError(
        'An error occurred while executing the transaction',
        CheckoutErrorType.EXECUTE_TRANSACTIONS_ERROR,
        {
          message: err.message,
        },
      );
    }
  }
};
