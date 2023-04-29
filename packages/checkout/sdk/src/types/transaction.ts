import { TransactionResponse, Web3Provider } from '@ethersproject/providers';

/**
 * Interface representing the parameters for {@link Checkout.sendTransaction}.
 * @property {Web3Provider} provider - The provider to connect to the Ethereum network.
 * @property {Transaction} transaction - The transaction to send.
 */
export interface SendTransactionParams {
  provider: Web3Provider;
  transaction: Transaction;
}

/**
 * Interface representing the result of {@link Checkout.sendTransaction}.
 * @property {TransactionResponse} transactionResponse - The response of the transaction.
 */
export interface SendTransactionResult {
  transactionResponse: TransactionResponse;
}

/**
 * Interface representing an Ethereum transaction.
 * @property {string} nonce - The transaction nonce.
 * @property {string} gasPrice - The gas price of the transaction.
 * @property {string} gas - The gas limit for the transaction.
 * @property {string} to - The address of the recipient.
 * @property {string} from - The address of the sender.
 * @property {string} value - The value to transfer in wei.
 * @property {string} data - The data to include in the transaction.
 * @property {number} chainId - The ID of the chain the transaction is for.
 */
export interface Transaction {
  nonce: string;
  gasPrice: string;
  gas: string;
  to: string;
  from: string;
  value: string;
  data: string;
  chainId: number;
}
