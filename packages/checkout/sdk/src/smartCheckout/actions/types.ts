import { TransactionRequest, TypedDataDomain, TypedDataField } from 'ethers';

export type UnsignedTransactions = {
  approvalTransactions: TransactionRequest[];
  fulfillmentTransactions: TransactionRequest[];
};

export type UnsignedMessage = {
  orderHash: string;
  orderComponents: any;
  unsignedMessage: {
    domain: TypedDataDomain;
    types: Record<string, TypedDataField[]>;
    value: Record<string, any>;
  },
};

export type SignedMessage = {
  orderHash: string;
  orderComponents: any;
  signedMessage: string;
};

export type SignTransactionResult = SignTransactionSuccessStatus | SignTransactionFailedStatus;

export interface SignTransactionSuccessStatus {
  type: SignTransactionStatusType.SUCCESS;
}

export interface SignTransactionFailedStatus {
  type: SignTransactionStatusType.FAILED;
  transactionHash: string;
  reason: string;
}

export enum SignTransactionStatusType {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}
