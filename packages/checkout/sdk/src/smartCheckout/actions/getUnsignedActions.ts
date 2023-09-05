import { TransactionRequest } from '@ethersproject/providers';
import { Action, TransactionPurpose, ActionType } from '@imtbl/orderbook';
import { UnsignedActions, SignableMessage } from '../../types';

export const getUnsignedActions = async (
  actions: Action[],
): Promise<UnsignedActions> => {
  let approvalTransactions: TransactionRequest[] = [];
  let fulfilmentTransactions: TransactionRequest[] = [];
  const signableMessages: SignableMessage[] = [];

  const approvalPromises: Promise<TransactionRequest>[] = [];
  const fulfilmentPromises: Promise<TransactionRequest>[] = [];

  for (const action of actions) {
    if (action.purpose === TransactionPurpose.APPROVAL) {
      approvalPromises.push(action.buildTransaction());
    }
    if (action.type === ActionType.SIGNABLE) {
      signableMessages.push({
        domain: action.message.domain,
        types: action.message.types,
        value: action.message.value,
      });
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
    signableMessages,
  };
};
