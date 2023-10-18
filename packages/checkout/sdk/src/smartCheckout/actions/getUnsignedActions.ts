import { TransactionRequest } from '@ethersproject/providers';
import {
  Action,
  TransactionPurpose,
  ActionType,
  SignablePurpose,
} from '@imtbl/orderbook';
import { UnsignedMessage, UnsignedTransactions } from './types';
import { performanceAsyncSnapshot } from '../../utils/performance';

export const getUnsignedERC721Transactions = performanceAsyncSnapshot(async (
  actions: Action[],
): Promise<UnsignedTransactions> => {
  let approvalTransactions: TransactionRequest[] = [];
  let fulfillmentTransactions: TransactionRequest[] = [];

  const approvalPromises: Promise<TransactionRequest>[] = [];
  const fulfillmentPromises: Promise<TransactionRequest>[] = [];
  for (const action of actions) {
    if (action.type !== ActionType.TRANSACTION) continue;
    if (action.purpose === TransactionPurpose.APPROVAL) {
      approvalPromises.push(action.buildTransaction());
    }
    if (action.purpose === TransactionPurpose.FULFILL_ORDER) {
      fulfillmentPromises.push(action.buildTransaction());
    }
  }
  approvalTransactions = await Promise.all(approvalPromises);
  fulfillmentTransactions = await Promise.all(fulfillmentPromises);

  return {
    approvalTransactions,
    fulfillmentTransactions,
  };
}, 'UnsignedERC721');

export const getUnsignedERC20ApprovalTransactions = performanceAsyncSnapshot(async (
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
}, 'UnsignedERC20Approval');

export const getUnsignedFulfillmentTransactions = performanceAsyncSnapshot(async (
  actions: Action[],
): Promise<TransactionRequest[]> => {
  let fulfillmentTransactions: TransactionRequest[] = [];

  const fulfillmentPromises: Promise<TransactionRequest>[] = [];
  for (const action of actions) {
    if (action.type !== ActionType.TRANSACTION) continue;
    if (action.purpose === TransactionPurpose.FULFILL_ORDER) {
      fulfillmentPromises.push(action.buildTransaction());
    }
  }
  fulfillmentTransactions = await Promise.all(fulfillmentPromises);

  return fulfillmentTransactions;
}, 'UnsignedFulfillment');

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
