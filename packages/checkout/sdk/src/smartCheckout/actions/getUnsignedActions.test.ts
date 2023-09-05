import {
  Action, ActionType, SignablePurpose, TransactionPurpose,
} from '@imtbl/orderbook';
import { PopulatedTransaction, TypedDataDomain } from 'ethers';
import { getUnsignedActions } from './getUnsignedActions';

describe('getUnsignedActions', () => {
  it('should get the unsigned transactions', async () => {
    const actions: Action[] = [
      {
        type: ActionType.TRANSACTION,
        purpose: TransactionPurpose.APPROVAL,
        buildTransaction: jest.fn().mockResolvedValue({ from: '0xAPPROVAL1' } as PopulatedTransaction),
      },
      {
        type: ActionType.SIGNABLE,
        purpose: SignablePurpose.CREATE_LISTING,
        message: {
          domain: {} as TypedDataDomain,
          types: { typedDataField: [] },
          value: { value: 'value' },
        },
      },
      {
        type: ActionType.TRANSACTION,
        purpose: TransactionPurpose.FULFILL_ORDER,
        buildTransaction: jest.fn().mockResolvedValue({ from: '0xTRANSACTION1' } as PopulatedTransaction),
      },
      {
        type: ActionType.TRANSACTION,
        purpose: TransactionPurpose.APPROVAL,
        buildTransaction: jest.fn().mockResolvedValue({ from: '0xAPPROVAL2' } as PopulatedTransaction),
      },
      {
        type: ActionType.SIGNABLE,
        purpose: SignablePurpose.CREATE_LISTING,
        message: {
          domain: {} as TypedDataDomain,
          types: { typedDataField2: [] },
          value: { value2: 'value' },
        },
      },
      {
        type: ActionType.TRANSACTION,
        purpose: TransactionPurpose.FULFILL_ORDER,
        buildTransaction: jest.fn().mockResolvedValue({ from: '0xTRANSACTION2' } as PopulatedTransaction),
      },
    ];

    await expect(getUnsignedActions(actions)).resolves.toEqual({
      approvalTransactions: [{ from: '0xAPPROVAL1' }, { from: '0xAPPROVAL2' }],
      fulfilmentTransactions: [{ from: '0xTRANSACTION1' }, { from: '0xTRANSACTION2' }],
      signableMessages: [
        {
          domain: {},
          types: { typedDataField: [] },
          value: { value: 'value' },
        },
        {
          domain: {},
          types: { typedDataField2: [] },
          value: { value2: 'value' },
        },
      ],
    });
  });

  it('should return empty arrays if no transactions or signable messages', async () => {
    const actions: Action[] = [];

    await expect(getUnsignedActions(actions)).resolves.toEqual({
      approvalTransactions: [],
      fulfilmentTransactions: [],
      signableMessages: [],
    });
  });
});
