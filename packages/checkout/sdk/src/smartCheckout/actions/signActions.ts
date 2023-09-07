import {
  TransactionReceipt,
  TransactionRequest,
  Web3Provider,
} from '@ethersproject/providers';
import { CheckoutError, CheckoutErrorType } from '../../errors';
import {
  SignTransactionResult, SignTransactionStatusType, SignedMessage, UnsignedMessage,
} from './types';

export const signApprovalTransactions = async (
  provider: Web3Provider,
  approvalTransactions: TransactionRequest[],
): Promise<SignTransactionResult> => {
  let receipts: TransactionReceipt[] = [];

  try {
    const response = await Promise.all(approvalTransactions.map((tx) => provider.getSigner().sendTransaction(tx)));
    receipts = await Promise.all(response.map((tx) => tx.wait()));
  } catch (err: any) {
    throw new CheckoutError(
      'An error occurred while executing the approval transaction',
      CheckoutErrorType.EXECUTE_APPROVAL_TRANSACTION_ERROR,
      {
        message: err.message,
      },
    );
  }

  for (const receipt of receipts) {
    if (receipt.status === 0) {
      return {
        type: SignTransactionStatusType.FAILED,
        transactionHash: receipt.transactionHash,
        reason: 'Approval transaction failed and was reverted',
      };
    }
  }

  return {
    type: SignTransactionStatusType.SUCCESS,
  };
};

export const signFulfilmentTransactions = async (
  provider: Web3Provider,
  fulfilmentTransactions: TransactionRequest[],
): Promise<SignTransactionResult> => {
  let receipts: TransactionReceipt[] = [];

  try {
    const response = await Promise.all(fulfilmentTransactions.map((tx) => provider.getSigner().sendTransaction(tx)));
    receipts = await Promise.all(response.map((tx) => tx.wait()));
  } catch (err: any) {
    throw new CheckoutError(
      'An error occurred while executing the fulfilment transaction',
      CheckoutErrorType.EXECUTE_FULFILMENT_TRANSACTION_ERROR,
      {
        message: err.message,
      },
    );
  }

  for (const receipt of receipts) {
    if (receipt.status === 0) {
      return {
        type: SignTransactionStatusType.FAILED,
        transactionHash: receipt.transactionHash,
        reason: 'Fulfilment transaction failed and was reverted',
      };
    }
  }

  return {
    type: SignTransactionStatusType.SUCCESS,
  };
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
      'An error occurred while signing the message',
      CheckoutErrorType.SIGN_MESSAGE_ERROR,
      {
        message: err.message,
      },
    );
  }
};
