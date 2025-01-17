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
