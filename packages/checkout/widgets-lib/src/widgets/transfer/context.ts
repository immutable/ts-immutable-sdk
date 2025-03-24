import { Checkout, WrappedBrowserProvider, GetBalanceResult } from '@imtbl/checkout-sdk';
import { TransactionReceipt } from 'ethers';
import { createContext, useContext } from 'react';

export type TransferFormState = {
  type: 'FORM';
  allowedBalances: GetBalanceResult[];
  checkout: Checkout;
  provider: WrappedBrowserProvider;
  amount: string;
  amountError: string;
  tokenAddress: string;
  toAddress: string;
  toAddressError: string;
};

export type TransferCompleteState = {
  type: 'COMPLETE';
  receipt: TransactionReceipt;
  chainId: number;
  checkout: Checkout;
  provider: WrappedBrowserProvider;
  allowedBalances: GetBalanceResult[];
};

export type TransferState =
  | { type: 'INITIALISING' }
  | TransferFormState
  | {
    type: 'AWAITING_APPROVAL';
    checkout: Checkout;
    provider: WrappedBrowserProvider;
    allowedBalances: GetBalanceResult[];
  }
  | {
    type: 'TRANSFERRING';
    checkout: Checkout;
    provider: WrappedBrowserProvider;
    allowedBalances: GetBalanceResult[];
  }
  | TransferCompleteState;

const transferContext = createContext<TransferState | null>(null);

export const useTransferContext = () => {
  const context = useContext(transferContext);
  if (!context) {
    throw new Error(
      'useTransferContext must be used within a TransferContextProvider',
    );
  }
  return context;
};
