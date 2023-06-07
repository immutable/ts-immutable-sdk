import { Web3Provider } from '@ethersproject/providers';
import { CheckoutErrorType, withCheckoutError } from '../errors';
import { SendTransactionResult } from '../types/transaction';
import { CheckoutConfiguration } from '../config';

export const sendTransaction = async (
  config: CheckoutConfiguration,
  web3Provider: Web3Provider,
  transaction: any,
): Promise<SendTransactionResult> => await withCheckoutError<SendTransactionResult>(
  async () => {
    const transactionResponse = await web3Provider!
      .getSigner()
      .sendTransaction(transaction);
    return {
      transactionResponse,
    };
  },
  { type: CheckoutErrorType.TRANSACTION_ERROR },
);
