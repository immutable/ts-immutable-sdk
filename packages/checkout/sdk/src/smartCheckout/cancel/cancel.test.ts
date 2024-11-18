/* eslint-disable @typescript-eslint/naming-convention */
import { Environment } from '@imtbl/config';
import { OrderStatusName } from '@imtbl/orderbook';
import { TypedDataDomain, PreparedTransactionRequest } from 'ethers';
import { CheckoutConfiguration } from '../../config';
import { CheckoutErrorType } from '../../errors';
import { cancel } from './cancel';
import { createOrderbookInstance } from '../../instance';
import { signFulfillmentTransactions } from '../actions';
import { CheckoutStatus, NamedBrowserProvider } from '../../types';
import { SignTransactionStatusType } from '../actions/types';
import { HttpClient } from '../../api/http';
import { sendTransaction } from '../../transaction';

jest.mock('../../instance');
jest.mock('../actions');
jest.mock('../../transaction');

describe('cancel', () => {
  let config: CheckoutConfiguration;
  let mockProvider: NamedBrowserProvider;

  beforeEach(() => {
    mockProvider = {
      getSigner: jest.fn().mockReturnValue({
        getAddress: jest.fn().mockResolvedValue('0xADDRESS'),
        _signTypedData: jest.fn().mockResolvedValue('0xSIGNED'),
      }),
    } as unknown as NamedBrowserProvider;

    const mockedHttpClient = new HttpClient() as jest.Mocked<HttpClient>;
    config = new CheckoutConfiguration({
      baseConfig: { environment: Environment.SANDBOX },
    }, mockedHttpClient);

    jest.spyOn(console, 'info').mockImplementation(() => {});
  });

  describe('on chain cancel', () => {
    it('should sign the cancel transaction', async () => {
      const orderId = '1';
      (createOrderbookInstance as jest.Mock).mockReturnValue({
        getListing: jest.fn().mockResolvedValue({
          result: {
            accountAddress: '0x123',
            status: { name: OrderStatusName.ACTIVE },
          },
        }),
        cancelOrdersOnChain: jest.fn().mockResolvedValue({
          cancellationAction: {
            buildTransaction: async () => ({
              to: '0xTO',
              from: '0xFROM',
              nonce: 1,
            }) as PreparedTransactionRequest,
          },
        }),
      });
      (signFulfillmentTransactions as jest.Mock).mockResolvedValue({
        type: SignTransactionStatusType.SUCCESS,
      });

      const result = await cancel(config, mockProvider, [orderId]);
      expect(result).toEqual({
        status: CheckoutStatus.SUCCESS,
      });
      expect(signFulfillmentTransactions).toBeCalledWith(
        mockProvider,
        [
          {
            to: '0xTO',
            from: '0xFROM',
            nonce: 1,
          },
        ],
      );
    });

    it('should return fulfillment transactions when waitFulfillmentSettlements override is false', async () => {
      const orderId = '1';
      (createOrderbookInstance as jest.Mock).mockReturnValue({
        getListing: jest.fn().mockResolvedValue({
          result: {
            accountAddress: '0x123',
            status: { name: OrderStatusName.ACTIVE },
          },
        }),
        cancelOrdersOnChain: jest.fn().mockResolvedValue({
          cancellationAction: {
            buildTransaction: async () => ({
              to: '0xTO',
              from: '0xFROM',
              nonce: 1,
            }) as PreparedTransactionRequest,
          },
        }),
      });
      (signFulfillmentTransactions as jest.Mock).mockResolvedValue({
        type: SignTransactionStatusType.SUCCESS,
      });
      (sendTransaction as jest.Mock).mockResolvedValue({
        transactionResponse: { hash: '0xTRANSACTION' },
      });

      const result = await cancel(config, mockProvider, [orderId], {
        waitFulfillmentSettlements: false,
      });
      expect(result).toEqual({
        status: CheckoutStatus.FULFILLMENTS_UNSETTLED,
        transactions: [{ hash: '0xTRANSACTION' }],
      });
    });

    it('should return failed status when transaction reverts', async () => {
      const orderId = '1';
      (createOrderbookInstance as jest.Mock).mockReturnValue({
        getListing: jest.fn().mockResolvedValue({
          result: {
            accountAddress: '0x123',
            status: { name: OrderStatusName.ACTIVE },
          },
        }),
        cancelOrdersOnChain: jest.fn().mockResolvedValue({
          cancellationAction: {
            buildTransaction: async () => ({
              to: '0xTO',
              from: '0xFROM',
              nonce: 1,
            }) as PreparedTransactionRequest,
          },
        }),
      });
      (signFulfillmentTransactions as jest.Mock).mockResolvedValue({
        type: SignTransactionStatusType.FAILED,
        transactionHash: '0xHASH',
        reason: 'Fulfillment transaction failed and was reverted',
      });

      const result = await cancel(config, mockProvider, [orderId]);
      expect(result).toEqual({
        status: CheckoutStatus.FAILED,
        transactionHash: '0xHASH',
        reason: 'Fulfillment transaction failed and was reverted',
      });
      expect(signFulfillmentTransactions).toBeCalledWith(
        mockProvider,
        [
          {
            to: '0xTO',
            from: '0xFROM',
            nonce: 1,
          },
        ],
      );
    });

    it('should throw error when sign rejects', async () => {
      const orderId = '1';
      (createOrderbookInstance as jest.Mock).mockReturnValue({
        getListing: jest.fn().mockResolvedValue({
          result: {
            accountAddress: '0x123',
            status: { name: OrderStatusName.ACTIVE },
          },
        }),
        cancelOrdersOnChain: jest.fn().mockResolvedValue({
          cancellationAction: {
            buildTransaction: async () => ({
              to: '0xTO',
              from: '0xFROM',
              nonce: 1,
            }) as PreparedTransactionRequest,
          },
        }),
      });
      (signFulfillmentTransactions as jest.Mock).mockRejectedValue(new Error('ERROR'));

      await expect(cancel(config, mockProvider, [orderId])).rejects.toThrow('ERROR');

      expect(signFulfillmentTransactions).toBeCalledWith(
        mockProvider,
        [
          {
            to: '0xTO',
            from: '0xFROM',
            nonce: 1,
          },
        ],
      );
    });

    it('should handle errors from orderbook', async () => {
      const orderId = '1';

      (createOrderbookInstance as jest.Mock).mockReturnValue({
        cancelOrdersOnChain: jest.fn().mockRejectedValue(
          new Error('Error from orderbook'),
        ),
      });

      let message;
      let type;
      let data;

      try {
        await cancel(config, mockProvider, [orderId]);
      } catch (err: any) {
        message = err.message;
        type = err.type;
        data = err.data;
      }

      expect(message).toEqual('An error occurred while cancelling the order listing');
      expect(type).toEqual(CheckoutErrorType.CANCEL_ORDER_LISTING_ERROR);
      expect(data.error.message).toEqual('Error from orderbook');
      expect(data.orderId).toEqual('1');
    });
  });

  describe('gasless cancel', () => {
    it('should call gasless cancel and get the cancellations', async () => {
      const orderId = '1';
      (createOrderbookInstance as jest.Mock).mockReturnValue({
        prepareOrderCancellations: jest.fn().mockResolvedValue({
          signableAction: {
            message: {
              domain: {} as TypedDataDomain,
              types: { types: [] },
              value: { values: '' },
            },
          },
        }),
        cancelOrders: jest.fn().mockResolvedValue({
          result: {
            successful_cancellations: [
              '018a8c71-d7e4-e303-a2ef-318871ef7756',
              '458a8c71-d7e4-e303-a2ef-318871ef7778',
            ],
            failed_cancellations: [
              {
                order: '458a8c71-d7e4-e303-a2ef-318871ef7790',
                reason_code: 'FILLED',
              },
              {
                order: '338a8c71-d7e4-e303-a2ef-318871ef7342',
                reason_code: 'FILLED',
              },
            ],
            pending_cancellations: [
              '238a8c71-d7e4-e303-a2ef-318871ef7778',
              '898a8c71-d7e4-e303-a2ef-318871ef7735',
            ],
          },
        }),
      });

      const result = await cancel(config, mockProvider, [orderId], { useGaslessCancel: true });
      expect(result).toEqual({
        successfulCancellations: [
          {
            orderId: '018a8c71-d7e4-e303-a2ef-318871ef7756',
          },
          {
            orderId: '458a8c71-d7e4-e303-a2ef-318871ef7778',
          },
        ],
        failedCancellations: [
          {
            orderId: '458a8c71-d7e4-e303-a2ef-318871ef7790',
            reason: 'FILLED',
          },
          {
            orderId: '338a8c71-d7e4-e303-a2ef-318871ef7342',
            reason: 'FILLED',
          },
        ],
        pendingCancellations: [
          {
            orderId: '238a8c71-d7e4-e303-a2ef-318871ef7778',
          },
          {
            orderId: '898a8c71-d7e4-e303-a2ef-318871ef7735',
          },
        ],
      });
    });

    it('should handle errors from orderbook', async () => {
      const orderId = '1';

      (createOrderbookInstance as jest.Mock).mockReturnValue({
        prepareOrderCancellations: jest.fn().mockRejectedValue(
          new Error('Error from orderbook'),
        ),
      });

      let message;
      let type;
      let data;

      try {
        await cancel(config, mockProvider, [orderId], { useGaslessCancel: true });
      } catch (err: any) {
        message = err.message;
        type = err.type;
        data = err.data;
      }

      expect(message).toEqual('An error occurred while cancelling the order listing');
      expect(type).toEqual(CheckoutErrorType.CANCEL_ORDER_LISTING_ERROR);
      expect(data.error.message).toEqual('Error from orderbook');
      expect(data.orderIds).toEqual([orderId]);
    });
  });
});
