import { FromAmountData } from '../../lib/squid/types';

export enum FiatOptionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export enum DirectCryptoPayOptionType {
  IMMUTABLE_ZKEVM = 'immutable-zkevm',
}

export type DirectCryptoPayData = {
  amountData: FromAmountData;
  isInsufficientGas: boolean;
};

export enum SquidRouteOptionType {
  SQUID_ROUTE = 'squid-route',
}

export type PurchaseError = {
  type: PurchaseErrorTypes;
  data?: Record<string, unknown>;
};

export enum PurchaseErrorTypes {
  DEFAULT = 'DEFAULT_ERROR',
  INVALID_PARAMETERS = 'INVALID_PARAMETERS',
  SERVICE_BREAKDOWN = 'SERVICE_BREAKDOWN',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  UNRECOGNISED_CHAIN = 'UNRECOGNISED_CHAIN',
  PROVIDER_ERROR = 'PROVIDER_ERROR',
  WALLET_FAILED = 'WALLET_FAILED',
  WALLET_REJECTED = 'WALLET_REJECTED',
  WALLET_REJECTED_NO_FUNDS = 'WALLET_REJECTED_NO_FUNDS',
  WALLET_POPUP_BLOCKED = 'WALLET_POPUP_BLOCKED',
  ROUTE_ERROR = 'ROUTE_ERROR',
}
