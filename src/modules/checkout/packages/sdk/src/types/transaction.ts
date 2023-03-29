import { TransactionResponse, Web3Provider } from "@ethersproject/providers";

export interface SendTransactionParams {
  provider: Web3Provider;
  transaction: Transaction;
}

export interface SendTransactionResult {
  transactionResponse: TransactionResponse;
}

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
