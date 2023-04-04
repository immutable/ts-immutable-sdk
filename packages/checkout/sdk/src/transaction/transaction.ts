import { CheckoutErrorType, withCheckoutError } from "../errors";
import { SendTransactionParams, SendTransactionResult } from "../types/transaction";

export const sendTransaction = async (params: SendTransactionParams): Promise<SendTransactionResult> => {
    const { provider, transaction } = params;
    return await withCheckoutError<SendTransactionResult>(async () => {
        const transactionResponse = await provider.getSigner().sendTransaction(transaction);
        return {
            transactionResponse,
        }
      }, { type: CheckoutErrorType.TRANSACTION_ERROR });
}
