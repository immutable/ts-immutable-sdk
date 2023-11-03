/* eslint-disable @typescript-eslint/naming-convention */
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
  type: SaleErrorTypes;
  data?: Record<string, unknown>;
};

export type SmartCheckoutError = {
  type: SaleErrorTypes;
  data?: Record<string, unknown>;
};

export type ExecutedTransaction = {
  method: string;
  hash: string | undefined;
};

export type ExecuteOrderResponse = {
  done: boolean;
  transactions:ExecutedTransaction[]
};

export enum SaleErrorTypes {
  DEFAULT = 'DEFAULT_ERROR',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  SERVICE_BREAKDOWN = 'SERVICE_BREAK_DOWN',
  TRANSAK_FAILED = 'TRANSAK_FAILED',
  WALLET_FAILED = 'WALLET_FAILED',
  WALLET_REJECTED = 'WALLET_REJECTED',
  WALLET_REJECTED_NO_FUNDS = 'WALLET_REJECTED_NO_FUNDS',
  SMART_CHECKOUT_ERROR = 'SMART_CHECKOUT_ERROR',
  SMART_CHECKOUT_EXECUTE_ERROR = 'SMART_CHECKOUT_EXECUTE_ERROR',
}

export type SignApiTransaction = {
  contract_address: string;
  gas_estimate: number;
  method_call: string;
  params: {
    amount?: number;
    spender?: string;
    data?: string[];
    deadline?: number;
    multicallSigner?: string;
    reference?: string;
    signature?: string;
    targets?: string[];
  };
  raw_data: string;
};

export type SignApiProduct = {
  detail: {
    amount: number;
    collection_address: string;
    token_id: string;
  }[];
  product_id: string;
};

export type SignApiResponse = {
  order: {
    currency: {
      name: string;
      decimals: number;
      erc20_address: string;
    };
    products: SignApiProduct[];
    total_amount: string;
  };
  transactions: SignApiTransaction[];
};

export enum SignCurrencyFilter {
  CONTRACT_ADDRESS = 'contract_address',
  CURRENCY_SYMBOL = 'currency_symbol',
}

export type SignApiRequest = {
  recipient_address: string;
  currency_filter: SignCurrencyFilter;
  currency_value: string;
  payment_type: string;
  products: {
    product_id: string;
    quantity: number;
  }[];
};

export type SignApiError = {
  code: string;
  details: any;
  link: string;
  message: string;
  trace_id: string;
};
