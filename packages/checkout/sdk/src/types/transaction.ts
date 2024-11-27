import { TransactionRequest, TransactionResponse, Eip1193Provider } from 'ethers';
import { WrappedBrowserProvider } from './provider';

/**
 * Interface representing the parameters for {@link Checkout.sendTransaction}.
 * @property {BrowserProvider} provider - The provider to connect to the network.
 * @property {TransactionRequest} transaction - The transaction to send.
 */
export interface SendTransactionParams {
  provider: WrappedBrowserProvider | Eip1193Provider;
  transaction: TransactionRequest;
}

/**
 * Interface representing the result of {@link Checkout.sendTransaction}.
 * @property {TransactionResponse} transactionResponse - The response of the transaction.
 */
export interface SendTransactionResult {
  transactionResponse: TransactionResponse;
}
