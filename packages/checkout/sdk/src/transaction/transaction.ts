import { CheckoutError, CheckoutErrorType } from '../errors';
import { SendTransactionParams, SendTransactionResult } from '../types';

export const sendTransaction = async (
  params: SendTransactionParams,
): Promise<SendTransactionResult> => {
  const { provider, transaction } = params;
  try {
    const transactionResponse = await provider
      .getSigner()
      .sendTransaction(transaction);

    return {
      transactionResponse,
    };
  } catch (err: any) {
    if (err.message.includes('user rejected')) {
      throw new CheckoutError(
        err.message,
        CheckoutErrorType.USER_REJECTED_REQUEST_ERROR,
        err,
      );
    }
    throw new CheckoutError(
      err.message,
      CheckoutErrorType.TRANSACTION_FAILED,
      err,
    );
  }
};
