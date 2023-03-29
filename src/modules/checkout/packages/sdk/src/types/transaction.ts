import { Web3Provider } from "@ethersproject/providers";

export interface SendTransactionParams {
  provider: Web3Provider;
  transaction: Transaction;
}

export interface SendTransactionResult {
  status: TransactionStatus;
  transaction: Transaction;
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

export enum TransactionStatus {
  SUCCESS = 'success',
  FAIL = 'fail',
}
