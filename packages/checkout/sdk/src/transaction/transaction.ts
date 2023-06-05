import { Web3Provider } from '@ethersproject/providers';
import { CheckoutErrorType, withCheckoutError } from '../errors';
import {
  SendTransactionResult,
  Transaction,
} from '../types/transaction';

export const sendTransaction = async (
  provider: Web3Provider,
  transaction: Transaction,
): Promise<SendTransactionResult> => await withCheckoutError<SendTransactionResult>(
  async () => {
    const transactionResponse = await provider
      .getSigner()
      .sendTransaction(transaction);
    return {
      transactionResponse,
    };
  },
  { type: CheckoutErrorType.TRANSACTION_ERROR },
);
