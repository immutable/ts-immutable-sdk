import {
  SaleItem,
  FundingStep,
  FundingItem,
  SmartCheckoutResult,
  WrappedBrowserProvider,
} from '@imtbl/checkout-sdk';

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
  provider: WrappedBrowserProvider | undefined;
  items: SaleItem[];
  fromTokenAddress: string;
  recipientAddress: string;
  environment: string;
  environmentId: string;
  waitFulfillmentSettlements: boolean;
  customOrderData?: Record<string, unknown>;
};

export type SignOrderError = {
  type: SaleErrorTypes;
  data?: Record<string, unknown>;
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
  FUNDING_ROUTE_EXECUTE_ERROR = 'FUNDING_ROUTE_EXECUTE_ERROR',
}

export type OrderQuoteCurrency = {
  base: boolean;
  decimals: number;
  address: string;
  exchangeId: string;
  name: string;
};

export type OrderQuotePricing = {
  amount: number;
  currency: string;
  type: string;
};

export type OrderQuoteProduct = {
  productId: string;
  quantity: number;
  pricing: Record<string, OrderQuotePricing>;
};

export type OrderQuote = {
  config: {
    contractId: string;
  },
  currencies: Array<OrderQuoteCurrency>;
  products: Record<string, OrderQuoteProduct>;
  totalAmount: Record<string, OrderQuotePricing>;
};

export enum SignPaymentTypes {
  CRYPTO = 'crypto',
  FIAT = 'fiat',
}

export enum FundingBalanceType {
  SUFFICIENT = 'SUFFICIENT',
}

export type SufficientFundingStep = {
  type: FundingBalanceType.SUFFICIENT;
  fundingItem: FundingItem;
};

export type FundingBalance = FundingStep | SufficientFundingStep;

export type FundingBalanceResult = {
  currency: OrderQuoteCurrency;
  smartCheckoutResult: SmartCheckoutResult;
};

export enum ExecuteTransactionStep {
  BEFORE = 'before',
  PENDING = 'pending',
  AFTER = 'after',
}
