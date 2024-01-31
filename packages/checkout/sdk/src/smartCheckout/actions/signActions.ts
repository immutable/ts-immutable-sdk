import {
  TransactionReceipt,
  TransactionRequest,
  Web3Provider,
} from '@ethersproject/providers';
import { CheckoutError, CheckoutErrorType } from '../../errors';
import {
  SignTransactionResult, SignTransactionStatusType, SignedMessage, UnsignedMessage,
} from './types';
import { sendTransaction } from '../../transaction';

export const signApprovalTransactions = async (
  provider: Web3Provider,
  approvalTransactions: TransactionRequest[],
): Promise<SignTransactionResult> => {
  let receipts: TransactionReceipt[] = [];

  try {
    const response = await Promise.all(
      approvalTransactions.map((transaction) => sendTransaction(provider, transaction)),
    );
    receipts = await Promise.all(response.map((transaction) => transaction.transactionResponse.wait()));
  } catch (err: any) {
    throw new CheckoutError(
      'An error occurred while executing the approval transaction',
      CheckoutErrorType.EXECUTE_APPROVAL_TRANSACTION_ERROR,
      { error: err },
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

export const signFulfillmentTransactions = async (
  provider: Web3Provider,
  fulfillmentTransactions: TransactionRequest[],
): Promise<SignTransactionResult> => {
  let receipts: TransactionReceipt[] = [];

  try {
    const response = await Promise.all(fulfillmentTransactions.map(
      (transaction) => sendTransaction(provider, transaction),
    ));
    receipts = await Promise.all(response.map((transaction) => transaction.transactionResponse.wait()));
  } catch (err: any) {
    throw new CheckoutError(
      'An error occurred while executing the fulfillment transaction',
      CheckoutErrorType.EXECUTE_FULFILLMENT_TRANSACTION_ERROR,
      { error: err },
    );
  }

  for (const receipt of receipts) {
    if (receipt.status === 0) {
      return {
        type: SignTransactionStatusType.FAILED,
        transactionHash: receipt.transactionHash,
        reason: 'Fulfillment transaction failed and was reverted',
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
      { error: err },
    );
  }
};
