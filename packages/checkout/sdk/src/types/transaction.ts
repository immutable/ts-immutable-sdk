import {
  TransactionRequest,
  TransactionResponse,
  Web3Provider,
} from '@ethersproject/providers';

/**
 * Interface representing the parameters for {@link Checkout.sendTransaction}.
 * @property {Web3Provider} provider - The provider to connect to the network.
 * @property {TransactionRequest} transaction - The transaction to send.
 */
export interface SendTransactionParams {
  provider: Web3Provider;
  transaction: TransactionRequest;
}

/**
 * Interface representing the result of {@link Checkout.sendTransaction}.
 * @property {TransactionResponse} transactionResponse - The response of the transaction.
 */
export interface SendTransactionResult {
  transactionResponse: TransactionResponse;
}
