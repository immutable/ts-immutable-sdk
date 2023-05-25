import { CheckoutErrorType, withCheckoutError } from '../errors';
import {
  SendTransactionParams,
  SendTransactionResult,
} from '../types/transaction';

export const sendTransaction = async (
  params: SendTransactionParams,
): Promise<SendTransactionResult> => {
  const { web3Provider, transaction } = params;
  return await withCheckoutError<SendTransactionResult>(
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
};
