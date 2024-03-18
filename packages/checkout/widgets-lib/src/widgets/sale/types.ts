import { Web3Provider } from '@ethersproject/providers';
import { SaleItem, ItemType } from '@imtbl/checkout-sdk';

export type SignedOrderProduct = {
  productId: string;
  qty: number;
  image: string;
  name: string;
  description: string;
  amount: number[];
  tokenId: string[];
  currency: string;
  contractType: string;
  collectionAddress: string;
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
  tokenAddress: string;
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
  transactionId: string;
};

export type SignOrderInput = {
  provider: Web3Provider | undefined;
  items: SaleItem[];
  fromTokenAddress: string;
  recipientAddress: string;
  environment: string;
  environmentId: string;
};

export type SignOrderError = {
  type: SaleErrorTypes;
  data?: Record<string, unknown>;
};

export type SmartCheckoutError = {
  type: SaleErrorTypes;
  data?: {
    error: Error;
    fractionalBalance?: Record<ItemType, boolean>
  }
};

export type ExecutedTransaction = {
  method: string;
  hash: string | undefined;
};

export type ExecuteOrderResponse = {
  done: boolean;
  transactions: ExecutedTransaction[];
};

export enum SaleErrorTypes {
  DEFAULT = 'DEFAULT_ERROR',
  INVALID_PARAMETERS = 'INVALID_PARAMETERS',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  SERVICE_BREAKDOWN = 'SERVICE_BREAKDOWN',
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',
  TRANSAK_FAILED = 'TRANSAK_FAILED',
  WALLET_FAILED = 'WALLET_FAILED',
  WALLET_REJECTED = 'WALLET_REJECTED',
  WALLET_REJECTED_NO_FUNDS = 'WALLET_REJECTED_NO_FUNDS',
  WALLET_POPUP_BLOCKED = 'WALLET_POPUP_BLOCKED',
  SMART_CHECKOUT_ERROR = 'SMART_CHECKOUT_ERROR',
  SMART_CHECKOUT_EXECUTE_ERROR = 'SMART_CHECKOUT_EXECUTE_ERROR',
}

export enum SmartCheckoutErrorTypes {
  FRACTIONAL_BALANCE_BLOCKED = 'FRACTIONAL_BALANCE_BLOCKED',
}

export type ClientConfigCurrency = {
  name: string;
  decimals: number;
  erc20Address: string;
};

export type ClientConfig = {
  contractId: string;
  currencies: ClientConfigCurrency[];
};

export enum SignPaymentTypes {
  CRYPTO = 'crypto',
  FIAT = 'fiat',
}
