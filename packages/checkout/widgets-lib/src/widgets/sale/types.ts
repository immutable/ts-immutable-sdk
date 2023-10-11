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
  qty: number;
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
    reference: string;
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

export type SignOrderError = {
  type: MintErrorTypes;
  data?: Record<string, unknown>;
};

export enum MintErrorTypes {
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  SERVICE_BREAKDOWN = 'SERVICE_BREAK_DOWN',
  TRANSAK_FAILED = 'TRANSAK_FAILED',
  PASSPORT_FAILED = 'PASSPORT_FAILED',
  PASSPORT_REJECTED_NO_FUNDS = 'PASSPORT_REJECTED_NO_FUNDS',
  PASSPORT_REJECTED = 'PASSPORT_REJECTED',
  DEFAULT = 'DEFAULT',
}
