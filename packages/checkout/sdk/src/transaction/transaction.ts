import { ethers } from 'ethers';
import { TransactionRequest, Web3Provider } from '@ethersproject/providers';
import { CheckoutError, CheckoutErrorType } from '../errors';
import { SendTransactionResult } from '../types';

export const sendTransaction = async (
  web3Provider: Web3Provider,
  transaction: TransactionRequest,
): Promise<SendTransactionResult> => {
  try {
    const transactionResponse = await web3Provider
      .getSigner()
      .sendTransaction(transaction);

    return {
      transactionResponse,
    };
  } catch (err: any) {
    if (err.code === ethers.errors.INSUFFICIENT_FUNDS) {
      throw new CheckoutError(
        err.message,
        CheckoutErrorType.INSUFFICIENT_FUNDS,
      );
    }
    if (err.code === ethers.errors.ACTION_REJECTED) {
      throw new CheckoutError(
        err.message,
        CheckoutErrorType.USER_REJECTED_REQUEST_ERROR,
      );
    }
    if (err.code === ethers.errors.UNPREDICTABLE_GAS_LIMIT) {
      throw new CheckoutError(
        err.message,
        CheckoutErrorType.UNPREDICTABLE_GAS_LIMIT,
      );
    }
    throw new CheckoutError(
      err.message,
      CheckoutErrorType.TRANSACTION_FAILED,
    );
  }
};
