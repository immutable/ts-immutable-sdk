import { Web3Provider } from '@ethersproject/providers';

export type Item = {
  productId: string;
  qty: number;
  name: string;
  image: string;
  description: string;
};

export enum PaymentTypes {
  CRYPTO = 'crypto',
  FIAT = 'fiat',
}

export type SignedOrderProduct = {
  productId: string;
  qty: string;
  image: string;
  name: string;
  description: string;
  amount: number[];
  tokenId: number[];
  currency: string;
};

export type SignedOrder = {
  currency: {
    name: string;
    erc20Address: string;
  };
  totalAmount: number;
  products: SignedOrderProduct[];
};

export type SignedTransaction = {
  contractAddress: string;
  gasEstimate: number;
  methodCall: string;
  params: {
    amount: number;
    spender: string;
  };
  rawData: string;
};

export type SignResponse = {
  order: SignedOrder;
  transactions: SignedTransaction[];
};

export type SignOrderInput = {
  provider: Web3Provider | undefined;
  items: Item[];
  fromContractAddress: string;
  recipientAddress: string;
  env: string;
  environmentId: string;
};

export enum MintErrorTypes {
  TRANSACTION_FAILED = 'transactionFailed',
  SERVICE_BREAKDOWN = 'serviceBreakDown',
  TRANSAK_FAILED = 'transakFailed',
  PASSPORT_FAILED = 'passportFailed',
  PASSPORT_REJECTED_NO_FUNDS = 'passportRejectedNoFunds',
  PASSPORT_REJECTED = 'passportRejected',
  DEFAULT = 'default',
}
