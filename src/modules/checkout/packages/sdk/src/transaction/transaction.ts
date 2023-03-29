import { CheckoutErrorType, withCheckoutError } from "../errors";
import { SendTransactionParams, SendTransactionResult, TransactionStatus } from "../types/transaction";

export const sendTransaction = async (params: SendTransactionParams): Promise<SendTransactionResult> => {
    const { provider, transaction } = params;

    return await withCheckoutError<SendTransactionResult>(async () => {
        // todo: how do we know from response whether its success or fail?
        const response = await provider.getSigner().sendTransaction(transaction);
        console.log('sendTransaction response: ', response);
        return {
            status: TransactionStatus.SUCCESS,
            transaction
        }
      }, { type: CheckoutErrorType.TRANSACTION_FAILED });
}
