import { TransactionRequest } from '@ethersproject/providers';
import { TypedDataDomain, TypedDataField } from 'ethers';

export type UnsignedTransactions = {
  approvalTransactions: TransactionRequest[];
  fulfilmentTransactions: TransactionRequest[];
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
