import {
  Action, ActionType, SignablePurpose, TransactionPurpose,
} from '@imtbl/orderbook';
import { PopulatedTransaction, TypedDataDomain } from 'ethers';
import {
  getUnsignedERC20ApprovalTransactions,
  getUnsignedERC721Transactions,
  getUnsignedFulfillmentTransactions,
  getUnsignedMessage,
} from './getUnsignedActions';

describe('getUnsignedActions', () => {
  describe('getUnsignedERC721Transactions', () => {
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

      await expect(getUnsignedERC721Transactions(actions)).resolves.toEqual({
        approvalTransactions: [{ from: '0xAPPROVAL1' }, { from: '0xAPPROVAL2' }],
        fulfillmentTransactions: [{ from: '0xTRANSACTION1' }, { from: '0xTRANSACTION2' }],
      });
    });

    it('should return empty arrays if no transactions or signable messages', async () => {
      const actions: Action[] = [];

      await expect(getUnsignedERC721Transactions(actions)).resolves.toEqual({
        approvalTransactions: [],
        fulfillmentTransactions: [],
      });
    });
  });

  describe('getUnsignedERC20ApprovalTransactions', () => {
    it('should get the unsigned erc20 approval transactions', async () => {
      const actions: Action[] = [
        {
          type: ActionType.TRANSACTION,
          purpose: TransactionPurpose.APPROVAL,
          buildTransaction: jest.fn().mockResolvedValue({ from: '0xAPPROVAL1' } as PopulatedTransaction),
        },
        {
          type: ActionType.TRANSACTION,
          purpose: TransactionPurpose.APPROVAL,
          buildTransaction: jest.fn().mockResolvedValue({ from: '0xAPPROVAL2' } as PopulatedTransaction),
        },
        {
          type: ActionType.TRANSACTION,
          purpose: TransactionPurpose.FULFILL_ORDER,
          buildTransaction: jest.fn().mockResolvedValue({ from: '0xTRANSACTION1' } as PopulatedTransaction),
        },
      ];

      await expect(getUnsignedERC20ApprovalTransactions(actions)).resolves
        .toEqual([{ from: '0xAPPROVAL1' }, { from: '0xAPPROVAL2' }]);
    });

    it('should return an empty arrays if no transactions', async () => {
      const actions: Action[] = [];

      await expect(getUnsignedERC20ApprovalTransactions(actions)).resolves.toEqual([]);
    });
  });

  describe('getUnsignedFulfillmentTransactions', () => {
    it('should get the unsigned fulfill transactions', async () => {
      const actions: Action[] = [
        {
          type: ActionType.TRANSACTION,
          purpose: TransactionPurpose.FULFILL_ORDER,
          buildTransaction: jest.fn().mockResolvedValue({ from: '0xTRANSACTION1' } as PopulatedTransaction),
        },
        {
          type: ActionType.TRANSACTION,
          purpose: TransactionPurpose.FULFILL_ORDER,
          buildTransaction: jest.fn().mockResolvedValue({ from: '0xTRANSACTION2' } as PopulatedTransaction),
        },
        {
          type: ActionType.TRANSACTION,
          purpose: TransactionPurpose.APPROVAL,
          buildTransaction: jest.fn().mockResolvedValue({ from: '0xAPPROVAL1' } as PopulatedTransaction),
        },
      ];

      await expect(getUnsignedFulfillmentTransactions(actions)).resolves
        .toEqual([{ from: '0xTRANSACTION1' }, { from: '0xTRANSACTION2' }]);
    });

    it('should return an empty arrays if no transactions', async () => {
      const actions: Action[] = [];

      await expect(getUnsignedFulfillmentTransactions(actions)).resolves.toEqual([]);
    });
  });

  describe('getUnsignedMessage', () => {
    it('should get the signed message', () => {
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
      ];

      expect(getUnsignedMessage('hash', { orderComponents: {} }, actions)).toEqual({
        orderHash: 'hash',
        orderComponents: { orderComponents: {} },
        unsignedMessage:
          {
            domain: {},
            types: { typedDataField: [] },
            value: { value: 'value' },
          },
      });
    });

    it('should return undefined if no signable action', () => {
      const actions: Action[] = [
        {
          type: ActionType.TRANSACTION,
          purpose: TransactionPurpose.APPROVAL,
          buildTransaction: jest.fn().mockResolvedValue({ from: '0xAPPROVAL1' } as PopulatedTransaction),
        },
        {
          type: ActionType.TRANSACTION,
          purpose: TransactionPurpose.FULFILL_ORDER,
          buildTransaction: jest.fn().mockResolvedValue({ from: '0xTRANSACTION1' } as PopulatedTransaction),
        },
      ];

      expect(getUnsignedMessage('hash', { orderComponents: {} }, actions)).toBeUndefined();
    });
  });
});
