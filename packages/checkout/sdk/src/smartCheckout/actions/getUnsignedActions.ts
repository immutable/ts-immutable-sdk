import { TransactionRequest } from '@ethersproject/providers';
import {
  Action,
  TransactionPurpose,
  ActionType,
  SignablePurpose,
} from '@imtbl/orderbook';
import { UnsignedMessage, UnsignedTransactions } from './types';

export const getUnsignedERC721Transactions = async (
  actions: Action[],
): Promise<UnsignedTransactions> => {
  let approvalTransactions: TransactionRequest[] = [];
  let fulfilmentTransactions: TransactionRequest[] = [];

  const approvalPromises: Promise<TransactionRequest>[] = [];
  const fulfilmentPromises: Promise<TransactionRequest>[] = [];
  for (const action of actions) {
    if (action.type !== ActionType.TRANSACTION) continue;
    if (action.purpose === TransactionPurpose.APPROVAL) {
      approvalPromises.push(action.buildTransaction());
    }
    if (action.purpose === TransactionPurpose.FULFILL_ORDER) {
      fulfilmentPromises.push(action.buildTransaction());
    }
  }
  approvalTransactions = await Promise.all(approvalPromises);
  fulfilmentTransactions = await Promise.all(fulfilmentPromises);

  return {
    approvalTransactions,
    fulfilmentTransactions,
  };
};

export const getUnsignedERC20ApprovalTransactions = async (
  actions: Action[],
): Promise<TransactionRequest[]> => {
  let approvalTransactions: TransactionRequest[] = [];

  const approvalPromises: Promise<TransactionRequest>[] = [];
  for (const action of actions) {
    if (action.type !== ActionType.TRANSACTION) continue;
    if (action.purpose === TransactionPurpose.APPROVAL) {
      approvalPromises.push(action.buildTransaction());
    }
  }
  approvalTransactions = await Promise.all(approvalPromises);

  return approvalTransactions;
};

export const getUnsignedFulfilmentTransactions = async (
  actions: Action[],
): Promise<TransactionRequest[]> => {
  let fulfilmentTransactions: TransactionRequest[] = [];

  const fulfilmentPromises: Promise<TransactionRequest>[] = [];
  for (const action of actions) {
    if (action.type !== ActionType.TRANSACTION) continue;
    if (action.purpose === TransactionPurpose.FULFILL_ORDER) {
      fulfilmentPromises.push(action.buildTransaction());
    }
  }
  fulfilmentTransactions = await Promise.all(fulfilmentPromises);

  return fulfilmentTransactions;
};

export const getUnsignedMessage = (
  orderHash: string,
  orderComponents: any,
  actions: Action[],
): UnsignedMessage | undefined => {
  let unsignedMessage;

  for (const action of actions) {
    if (action.type !== ActionType.SIGNABLE) continue;
    if (action.purpose === SignablePurpose.CREATE_LISTING) {
      unsignedMessage = {
        domain: action.message.domain,
        types: action.message.types,
        value: action.message.value,
      };
    }
  }

  if (!unsignedMessage) return undefined;

  return {
    orderHash,
    orderComponents,
    unsignedMessage,
  };
};
