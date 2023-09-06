// signActions.ts

import { TransactionRequest, TransactionResponse, Web3Provider } from '@ethersproject/providers';
import { CheckoutError, CheckoutErrorType } from '../../errors';
import { SignedMessage, UnsignedMessage } from './types';

export const signApprovalTransactions = async (
  provider: Web3Provider,
  approvalTransactions: TransactionRequest[],
): Promise<void> => {
  try {
    const transactions: Promise<TransactionResponse>[] = [];
    for (const approvalTransaction of approvalTransactions) {
      transactions.push(provider.getSigner().sendTransaction(approvalTransaction));
    }
    await Promise.all(transactions);
  } catch (err: any) {
    throw new CheckoutError(
      'An error occurred while executing the approval transaction',
      CheckoutErrorType.EXECUTE_TRANSACTIONS_ERROR,
      {
        message: err.message,
      },
    );
  }
};

export const signFulfilmentTransactions = async (
  provider: Web3Provider,
  fulfilmentTransactions: TransactionRequest[],
): Promise<void> => {
  try {
    const transactions: Promise<TransactionResponse>[] = [];
    for (const fulfilmentTransaction of fulfilmentTransactions) {
      transactions.push(provider.getSigner().sendTransaction(fulfilmentTransaction));
    }
    await Promise.all(transactions);
  } catch (err: any) {
    throw new CheckoutError(
      'An error occurred while executing the fulfilment transaction',
      CheckoutErrorType.EXECUTE_TRANSACTIONS_ERROR,
      {
        message: err.message,
      },
    );
  }
};

export const signMessage = async (
  provider: Web3Provider,
  unsignedMessage: UnsignedMessage,
): Promise<SignedMessage> => {
  try {
    // eslint-disable-next-line no-underscore-dangle
    const signedMessage = await provider.getSigner()._signTypedData(
      unsignedMessage.unsignedMessage.domain,
      unsignedMessage.unsignedMessage.types,
      unsignedMessage.unsignedMessage.value,
    );
    return {
      orderComponents: unsignedMessage.orderComponents,
      orderHash: unsignedMessage.orderHash,
      signedMessage,
    };
  } catch (err: any) {
    throw new CheckoutError(
      'An error occurred while executing the fulfilment transaction',
      CheckoutErrorType.EXECUTE_TRANSACTIONS_ERROR,
      {
        message: err.message,
      },
    );
  }
};
