/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
import { TransactionRequest, Web3Provider } from '@ethersproject/providers';
import { TypedDataDomain } from 'ethers';
import { signApprovalTransactions, signFulfilmentTransactions, signMessage } from './signActions';
import { CheckoutErrorType } from '../../errors';
import { SignTransactionStatusType, UnsignedMessage } from './types';

describe('signActions', () => {
  let mockProvider: Web3Provider;

  describe('signApprovalTransactions', () => {
    it('should sign approval transactions', async () => {
      mockProvider = {
        getSigner: jest.fn().mockReturnValue({
          sendTransaction: jest.fn().mockResolvedValue({
            wait: jest.fn().mockResolvedValue({
              status: 1,
            }),
          }),
        }),
      } as unknown as Web3Provider;

      const approvalTransactions: TransactionRequest[] = [
        {
          to: '0x123',
          data: '0xAPPROVAL1',
        },
        {
          to: '0x123',
          data: '0xAPPROVAL2',
        },
      ];

      const result = await signApprovalTransactions(mockProvider, approvalTransactions);
      expect(result).toEqual({
        type: SignTransactionStatusType.SUCCESS,
      });
      expect(mockProvider.getSigner().sendTransaction).toHaveBeenCalledTimes(2);
      expect(mockProvider.getSigner().sendTransaction).toHaveBeenCalledWith({
        data: '0xAPPROVAL1',
        to: '0x123',
      });
      expect(mockProvider.getSigner().sendTransaction).toHaveBeenCalledWith({
        data: '0xAPPROVAL2',
        to: '0x123',
      });
    });

    it('should return failed when approval transaction reverted', async () => {
      mockProvider = {
        getSigner: jest.fn().mockReturnValue({
          sendTransaction: jest.fn().mockResolvedValue({
            wait: jest.fn().mockResolvedValue({
              status: 0,
              transactionHash: '0xHASH',
            }),
          }),
        }),
      } as unknown as Web3Provider;

      const approvalTransactions: TransactionRequest[] = [
        {
          to: '0x123',
          data: '0xAPPROVAL1',
        },
      ];

      const result = await signApprovalTransactions(mockProvider, approvalTransactions);
      expect(result).toEqual({
        type: SignTransactionStatusType.FAILED,
        transactionHash: '0xHASH',
        reason: 'Approval transaction failed and was reverted',
      });
    });

    it('should throw error when sending the approval transaction errors', async () => {
      mockProvider = {
        getSigner: jest.fn().mockReturnValue({
          sendTransaction: jest.fn().mockRejectedValue(new Error('approval error')),
        }),
      } as unknown as Web3Provider;

      const approvalTransactions: TransactionRequest[] = [
        {
          to: '0x123',
          data: '0xAPPROVAL1',
        },
      ];

      let message;
      let type;
      let data;

      try {
        await signApprovalTransactions(mockProvider, approvalTransactions);
      } catch (err: any) {
        message = err.message;
        type = err.type;
        data = err.data;
      }

      expect(message).toEqual('An error occurred while executing the approval transaction');
      expect(type).toEqual(CheckoutErrorType.EXECUTE_APPROVAL_TRANSACTION_ERROR);
      expect(data).toEqual({
        message: 'approval error',
      });
    });
  });

  describe('signFulfilmentTransactions', () => {
    it('should sign fulfilment transactions', async () => {
      mockProvider = {
        getSigner: jest.fn().mockReturnValue({
          sendTransaction: jest.fn().mockResolvedValue({
            wait: jest.fn().mockResolvedValue({
              status: 1,
            }),
          }),
        }),
      } as unknown as Web3Provider;

      const approvalTransactions: TransactionRequest[] = [
        {
          to: '0x123',
          data: '0xFULFILMENT1',
        },
        {
          to: '0x123',
          data: '0xFULFILMENT2',
        },
      ];

      await signFulfilmentTransactions(mockProvider, approvalTransactions);
      expect(mockProvider.getSigner().sendTransaction).toHaveBeenCalledTimes(2);
      expect(mockProvider.getSigner().sendTransaction).toHaveBeenCalledWith({
        data: '0xFULFILMENT1',
        to: '0x123',
      });
      expect(mockProvider.getSigner().sendTransaction).toHaveBeenCalledWith({
        data: '0xFULFILMENT2',
        to: '0x123',
      });
    });

    it('should return failed when approval transaction reverted', async () => {
      mockProvider = {
        getSigner: jest.fn().mockReturnValue({
          sendTransaction: jest.fn().mockResolvedValue({
            wait: jest.fn().mockResolvedValue({
              status: 0,
              transactionHash: '0xHASH',
            }),
          }),
        }),
      } as unknown as Web3Provider;

      const fulfilmentTransactions: TransactionRequest[] = [
        {
          to: '0x123',
          data: '0xAPPROVAL1',
        },
      ];

      const result = await signFulfilmentTransactions(mockProvider, fulfilmentTransactions);
      expect(result).toEqual({
        type: SignTransactionStatusType.FAILED,
        transactionHash: '0xHASH',
        reason: 'Fulfilment transaction failed and was reverted',
      });
    });

    it('should throw error when sending the fulfilment transaction errors', async () => {
      mockProvider = {
        getSigner: jest.fn().mockReturnValue({
          sendTransaction: jest.fn().mockRejectedValue(new Error('fulfilment error')),
        }),
      } as unknown as Web3Provider;

      const approvalTransactions: TransactionRequest[] = [
        {
          to: '0x123',
          data: '0xFULFILMENT1',
        },
      ];

      let message;
      let type;
      let data;

      try {
        await signFulfilmentTransactions(mockProvider, approvalTransactions);
      } catch (err: any) {
        message = err.message;
        type = err.type;
        data = err.data;
      }

      expect(message).toEqual('An error occurred while executing the fulfilment transaction');
      expect(type).toEqual(CheckoutErrorType.EXECUTE_FULFILMENT_TRANSACTION_ERROR);
      expect(data).toEqual({
        message: 'fulfilment error',
      });
    });
  });

  describe('signMessage', () => {
    it('should sign the signable message', async () => {
      mockProvider = {
        getSigner: jest.fn().mockReturnValue({
          _signTypedData: jest.fn().mockResolvedValue('0xSIGNATURE'),
        }),
      } as unknown as Web3Provider;

      const unsignedMessage: UnsignedMessage = {
        orderHash: 'hash',
        orderComponents: { orderComponents: {} },
        unsignedMessage: {
          domain: {
            domain: 'domain',
          } as TypedDataDomain,
          types: { typedDataField: [] },
          value: { value: 'value' },
        },
      };

      const signedMessage = await signMessage(mockProvider, unsignedMessage);
      expect(signedMessage).toEqual({
        orderHash: 'hash',
        orderComponents: { orderComponents: {} },
        signedMessage: '0xSIGNATURE',
      });
      expect(mockProvider.getSigner()._signTypedData).toHaveBeenCalledWith(
        {
          domain: 'domain',
        } as TypedDataDomain,
        { typedDataField: [] },
        { value: 'value' },
      );
    });

    it('should throw error when sign message errors', async () => {
      mockProvider = {
        getSigner: jest.fn().mockReturnValue({
          _signTypedData: jest.fn().mockRejectedValue(new Error('sign message error')),
        }),
      } as unknown as Web3Provider;

      const unsignedMessage: UnsignedMessage = {
        orderHash: 'hash',
        orderComponents: { orderComponents: {} },
        unsignedMessage: {
          domain: {
            domain: 'domain',
          } as TypedDataDomain,
          types: { typedDataField: [] },
          value: { value: 'value' },
        },
      };

      let message;
      let type;
      let data;

      try {
        await signMessage(mockProvider, unsignedMessage);
      } catch (err: any) {
        message = err.message;
        type = err.type;
        data = err.data;
      }

      expect(message).toEqual('An error occurred while signing the message');
      expect(type).toEqual(CheckoutErrorType.SIGN_MESSAGE_ERROR);
      expect(data).toEqual({
        message: 'sign message error',
      });
    });
  });
});
