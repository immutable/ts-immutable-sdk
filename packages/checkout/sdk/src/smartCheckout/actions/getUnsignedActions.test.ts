import {
  Action, ActionType, SignablePurpose, TransactionPurpose,
} from '@imtbl/orderbook';
import {
  getUnsignedERC20ApprovalTransactions,
  getUnsignedSellTransactions,
  getUnsignedFulfillmentTransactions,
  getUnsignedMessage,
} from './getUnsignedActions';
import { PreparedTransactionRequest, TypedDataDomain } from 'ethers';

describe('getUnsignedActions', () => {
  describe('getUnsignedERC721Transactions', () => {
    it('should get the unsigned transactions', async () => {
      const actions: Action[] = [
        {
          type: ActionType.TRANSACTION,
          purpose: TransactionPurpose.APPROVAL,
          buildTransaction: jest.fn().mockResolvedValue({ from: '0xAPPROVAL1' } as PreparedTransactionRequest),
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
          buildTransaction: jest.fn().mockResolvedValue({ from: '0xTRANSACTION1' } as PreparedTransactionRequest),
        },
        {
          type: ActionType.TRANSACTION,
          purpose: TransactionPurpose.APPROVAL,
          buildTransaction: jest.fn().mockResolvedValue({ from: '0xAPPROVAL2' } as PreparedTransactionRequest),
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
          buildTransaction: jest.fn().mockResolvedValue({ from: '0xTRANSACTION2' } as PreparedTransactionRequest),
        },
      ];

      await expect(getUnsignedSellTransactions(actions)).resolves.toEqual({
        approvalTransactions: [{ from: '0xAPPROVAL1' }, { from: '0xAPPROVAL2' }],
        fulfillmentTransactions: [{ from: '0xTRANSACTION1' }, { from: '0xTRANSACTION2' }],
      });
    });

    it('should return empty arrays if no transactions or signable messages', async () => {
      const actions: Action[] = [];

      await expect(getUnsignedSellTransactions(actions)).resolves.toEqual({
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
          buildTransaction: jest.fn().mockResolvedValue({ from: '0xAPPROVAL1' } as PreparedTransactionRequest),
        },
        {
          type: ActionType.TRANSACTION,
          purpose: TransactionPurpose.APPROVAL,
          buildTransaction: jest.fn().mockResolvedValue({ from: '0xAPPROVAL2' } as PreparedTransactionRequest),
        },
        {
          type: ActionType.TRANSACTION,
          purpose: TransactionPurpose.FULFILL_ORDER,
          buildTransaction: jest.fn().mockResolvedValue({ from: '0xTRANSACTION1' } as PreparedTransactionRequest),
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
          buildTransaction: jest.fn().mockResolvedValue({ from: '0xTRANSACTION1' } as PreparedTransactionRequest),
        },
        {
          type: ActionType.TRANSACTION,
          purpose: TransactionPurpose.FULFILL_ORDER,
          buildTransaction: jest.fn().mockResolvedValue({ from: '0xTRANSACTION2' } as PreparedTransactionRequest),
        },
        {
          type: ActionType.TRANSACTION,
          purpose: TransactionPurpose.APPROVAL,
          buildTransaction: jest.fn().mockResolvedValue({ from: '0xAPPROVAL1' } as PreparedTransactionRequest),
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
          buildTransaction: jest.fn().mockResolvedValue({ from: '0xAPPROVAL1' } as PreparedTransactionRequest),
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
          buildTransaction: jest.fn().mockResolvedValue({ from: '0xTRANSACTION1' } as PreparedTransactionRequest),
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
          buildTransaction: jest.fn().mockResolvedValue({ from: '0xAPPROVAL1' } as PreparedTransactionRequest),
        },
        {
          type: ActionType.TRANSACTION,
          purpose: TransactionPurpose.FULFILL_ORDER,
          buildTransaction: jest.fn().mockResolvedValue({ from: '0xTRANSACTION1' } as PreparedTransactionRequest),
        },
      ];

      expect(getUnsignedMessage('hash', { orderComponents: {} }, actions)).toBeUndefined();
    });
  });
});
