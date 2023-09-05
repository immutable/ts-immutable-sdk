import { Web3Provider } from '@ethersproject/providers';
import { CheckoutError, CheckoutErrorType } from '../../errors';
import { UnsignedActions } from '../../types';

export const signActions = async (
  provider: Web3Provider,
  unsignedActions: UnsignedActions,
) => {
  if (unsignedActions.approvalTransactions.length > 0) {
    try {
      const approvalTransactions = [];
      for (const approvalTransaction of unsignedActions.approvalTransactions) {
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
  if (unsignedActions.signableMessages.length > 0) {
    try {
      const signableMessages = [];
      for (const signableMessage of unsignedActions.signableMessages) {
        // eslint-disable-next-line no-underscore-dangle
        signableMessages.push(provider.getSigner()._signTypedData(
          signableMessage.domain,
          signableMessage.types,
          signableMessage.value,
        ));
      }
      await Promise.all(signableMessages);
    } catch (err: any) {
      throw new CheckoutError(
        'An error occurred while executing the signable transaction',
        CheckoutErrorType.EXECUTE_TRANSACTIONS_ERROR,
        {
          message: err.message,
        },
      );
    }
  }
  if (unsignedActions.fulfilmentTransactions.length > 0) {
    try {
      const fulfilmentTransactions = [];
      for (const fulfilmentTransaction of unsignedActions.fulfilmentTransactions) {
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
