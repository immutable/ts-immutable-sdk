import { ethers } from 'ethers';
import { TransactionRequest, Web3Provider } from '@ethersproject/providers';
import { CheckoutError, CheckoutErrorType } from '../errors';
import { SendTransactionResult } from '../types';

export const sendTransaction = async (
  web3Provider: Web3Provider,
  transaction: TransactionRequest,
): Promise<SendTransactionResult> => {
  try {
    // const updatedTransaction = { ...transaction, gasLimit: '15000000', gasPrice: '100000000000' };
    console.log('checkoutSendTransaction', transaction);
    const transactionResponse = await web3Provider
      .getSigner()
      .sendTransaction(transaction);

    // if (!web3Provider.provider?.request) {
    //   throw new Error();
    // }
    // // const signer = await web3Provider.getSigner();
    // // signer.sendTransaction;

    // const transactionResponse = await web3Provider.provider.request(
    //   { method: 'eth_sendTransaction', params: [transaction] },
    // );

    return {
      transactionResponse,
    };
  } catch (err: any) {
    console.error('checkoutSendTransaction', err);
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
