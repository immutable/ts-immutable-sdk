import { Web3Provider } from '@ethersproject/providers';
import { CheckoutErrorType, withCheckoutError } from '../errors';
import { SendTransactionResult } from '../types/transaction';

export const sendTransaction = async (params: {
  web3Provider: Web3Provider;
  transaction: any;
}): Promise<SendTransactionResult> => {
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
