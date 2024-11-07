/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
import { BrowserProvider, TransactionRequest, TypedDataDomain } from 'ethers';
import { signApprovalTransactions, signFulfillmentTransactions, signMessage } from './signActions';
import { CheckoutErrorType } from '../../errors';
import { SignTransactionStatusType, UnsignedMessage } from './types';
import { IMMUTABLE_ZKVEM_GAS_OVERRIDES } from '../../env';
import { ChainId, NetworkInfo } from '../../types';

describe('signActions', () => {
  let mockProvider: BrowserProvider;

  describe('signApprovalTransactions', () => {
    it('should sign approval transactions', async () => {
      mockProvider = {
        getNetwork: jest.fn().mockReturnValue({
          chainId: ChainId.IMTBL_ZKEVM_TESTNET,
        } as NetworkInfo),
        getSigner: jest.fn().mockReturnValue({
          sendTransaction: jest.fn().mockResolvedValue({
            wait: jest.fn().mockResolvedValue({
              status: 1,
            }),
          }),
        }),
      } as unknown as BrowserProvider;

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
      expect((await mockProvider.getSigner()).sendTransaction).toHaveBeenCalledTimes(2);
      expect((await mockProvider.getSigner()).sendTransaction).toHaveBeenCalledWith({
        data: '0xAPPROVAL1',
        to: '0x123',
        maxFeePerGas: IMMUTABLE_ZKVEM_GAS_OVERRIDES.maxFeePerGas,
        maxPriorityFeePerGas: IMMUTABLE_ZKVEM_GAS_OVERRIDES.maxPriorityFeePerGas,
      });
      expect((await mockProvider.getSigner()).sendTransaction).toHaveBeenCalledWith({
        data: '0xAPPROVAL2',
        to: '0x123',
        maxFeePerGas: IMMUTABLE_ZKVEM_GAS_OVERRIDES.maxFeePerGas,
        maxPriorityFeePerGas: IMMUTABLE_ZKVEM_GAS_OVERRIDES.maxPriorityFeePerGas,
      });
    });

    it('should return failed when approval transaction reverted', async () => {
      mockProvider = {
        getNetwork: jest.fn().mockReturnValue({
          chainId: ChainId.IMTBL_ZKEVM_TESTNET,
        } as NetworkInfo),
        getSigner: jest.fn().mockReturnValue({
          sendTransaction: jest.fn().mockResolvedValue({
            wait: jest.fn().mockResolvedValue({
              status: 0,
              transactionHash: '0xHASH',
            }),
          }),
        }),
      } as unknown as BrowserProvider;

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
      } as unknown as BrowserProvider;

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
      expect(data.error).toBeDefined();
    });
  });

  describe('signFulfillmentTransactions', () => {
    it('should sign fulfillment transactions', async () => {
      mockProvider = {
        getNetwork: jest.fn().mockReturnValue({
          chainId: ChainId.IMTBL_ZKEVM_TESTNET,
        } as NetworkInfo),
        getSigner: jest.fn().mockReturnValue({
          sendTransaction: jest.fn().mockResolvedValue({
            wait: jest.fn().mockResolvedValue({
              status: 1,
            }),
          }),
        }),
      } as unknown as BrowserProvider;

      const approvalTransactions: TransactionRequest[] = [
        {
          to: '0x123',
          data: '0xFULFILLMENT1',
        },
        {
          to: '0x123',
          data: '0xFULFILLMENT2',
        },
      ];

      await signFulfillmentTransactions(mockProvider, approvalTransactions);
      expect((await mockProvider.getSigner()).sendTransaction).toHaveBeenCalledTimes(2);
      expect((await mockProvider.getSigner()).sendTransaction).toHaveBeenCalledWith({
        data: '0xFULFILLMENT1',
        to: '0x123',
        maxFeePerGas: IMMUTABLE_ZKVEM_GAS_OVERRIDES.maxFeePerGas,
        maxPriorityFeePerGas: IMMUTABLE_ZKVEM_GAS_OVERRIDES.maxPriorityFeePerGas,
      });
      expect((await mockProvider.getSigner()).sendTransaction).toHaveBeenCalledWith({
        data: '0xFULFILLMENT2',
        to: '0x123',
        maxFeePerGas: IMMUTABLE_ZKVEM_GAS_OVERRIDES.maxFeePerGas,
        maxPriorityFeePerGas: IMMUTABLE_ZKVEM_GAS_OVERRIDES.maxPriorityFeePerGas,
      });
    });

    it('should return failed when approval transaction reverted', async () => {
      mockProvider = {
        getNetwork: jest.fn().mockReturnValue({
          chainId: ChainId.IMTBL_ZKEVM_TESTNET,
        } as NetworkInfo),
        getSigner: jest.fn().mockReturnValue({
          sendTransaction: jest.fn().mockResolvedValue({
            wait: jest.fn().mockResolvedValue({
              status: 0,
              transactionHash: '0xHASH',
            }),
          }),
        }),
      } as unknown as BrowserProvider;

      const fulfillmentTransactions: TransactionRequest[] = [
        {
          to: '0x123',
          data: '0xAPPROVAL1',
        },
      ];

      const result = await signFulfillmentTransactions(mockProvider, fulfillmentTransactions);
      expect(result).toEqual({
        type: SignTransactionStatusType.FAILED,
        transactionHash: '0xHASH',
        reason: 'Fulfillment transaction failed and was reverted',
      });
    });

    it('should throw error when sending the fulfillment transaction errors', async () => {
      mockProvider = {
        getSigner: jest.fn().mockReturnValue({
          sendTransaction: jest.fn().mockRejectedValue(new Error('fulfillment error')),
        }),
      } as unknown as BrowserProvider;

      const approvalTransactions: TransactionRequest[] = [
        {
          to: '0x123',
          data: '0xFULFILLMENT1',
        },
      ];

      let message;
      let type;
      let data;

      try {
        await signFulfillmentTransactions(mockProvider, approvalTransactions);
      } catch (err: any) {
        message = err.message;
        type = err.type;
        data = err.data;
      }

      expect(message).toEqual('An error occurred while executing the fulfillment transaction');
      expect(type).toEqual(CheckoutErrorType.EXECUTE_FULFILLMENT_TRANSACTION_ERROR);
      expect(data.error).toBeDefined();
    });
  });

  describe('signMessage', () => {
    it('should sign the signable message', async () => {
      mockProvider = {
        getSigner: jest.fn().mockReturnValue({
          _signTypedData: jest.fn().mockResolvedValue('0xSIGNATURE'),
        }),
      } as unknown as BrowserProvider;

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
      expect((await mockProvider.getSigner()).signTypedData).toHaveBeenCalledWith(
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
      } as unknown as BrowserProvider;

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
      expect(data.error).toBeDefined();
    });
  });
});
