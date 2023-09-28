import { Web3Provider } from '@ethersproject/providers';
import { Environment } from '@imtbl/config';
import { OrderStatus } from '@imtbl/orderbook';
import { PopulatedTransaction } from 'ethers';
import { CheckoutConfiguration } from '../../config';
import { CheckoutError, CheckoutErrorType } from '../../errors';
import { cancel } from './cancel';
import { createOrderbookInstance } from '../../instance';
import { signFulfillmentTransactions } from '../actions';
import { SignTransactionStatusType } from '../actions/types';
import { CancelStatusType } from '../../types';

jest.mock('../../instance');
jest.mock('../actions');

describe('cancel', () => {
  describe('cancel', () => {
    let config: CheckoutConfiguration;
    let mockProvider: Web3Provider;

    beforeEach(() => {
      mockProvider = {
        getSigner: jest.fn().mockReturnValue({
          getAddress: jest.fn().mockResolvedValue('0xADDRESS'),
        }),
      } as unknown as Web3Provider;

      config = new CheckoutConfiguration({
        baseConfig: { environment: Environment.SANDBOX },
      });
    });

    it('should sign the cancel transaction', async () => {
      const orderId = '1';
      (createOrderbookInstance as jest.Mock).mockResolvedValue({
        getListing: jest.fn().mockResolvedValue({
          result: {
            accountAddress: '0x123',
            status: OrderStatus.ACTIVE,
          },
        }),
        cancelOrder: jest.fn().mockResolvedValue({
          unsignedCancelOrderTransaction: {
            to: '0xTO',
            from: '0xFROM',
            nonce: 1,
          } as PopulatedTransaction,
        }),
      });
      (signFulfillmentTransactions as jest.Mock).mockResolvedValue({
        type: SignTransactionStatusType.SUCCESS,
      });

      const result = await cancel(config, mockProvider, [orderId]);
      expect(result).toEqual({
        orderId: '1',
        status: {
          type: CancelStatusType.SUCCESS,
        },
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

    it('should return failed status when transaction reverts', async () => {
      const orderId = '1';
      (createOrderbookInstance as jest.Mock).mockResolvedValue({
        getListing: jest.fn().mockResolvedValue({
          result: {
            accountAddress: '0x123',
            status: OrderStatus.ACTIVE,
          },
        }),
        cancelOrder: jest.fn().mockResolvedValue({
          unsignedCancelOrderTransaction: {
            to: '0xTO',
            from: '0xFROM',
            nonce: 1,
          } as PopulatedTransaction,
        }),
      });
      (signFulfillmentTransactions as jest.Mock).mockResolvedValue({
        type: SignTransactionStatusType.FAILED,
        transactionHash: '0xHASH',
        reason: 'Fulfillment transaction failed and was reverted',
      });

      const result = await cancel(config, mockProvider, [orderId]);
      expect(result).toEqual({
        orderId: '1',
        status: {
          type: CancelStatusType.FAILED,
          transactionHash: '0xHASH',
          reason: 'Fulfillment transaction failed and was reverted',
        },
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
      (createOrderbookInstance as jest.Mock).mockResolvedValue({
        getListing: jest.fn().mockResolvedValue({
          result: {
            accountAddress: '0x123',
            status: OrderStatus.ACTIVE,
          },
        }),
        cancelOrder: jest.fn().mockResolvedValue({
          unsignedCancelOrderTransaction: {
            to: '0xTO',
            from: '0xFROM',
            nonce: 1,
          } as PopulatedTransaction,
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

      (createOrderbookInstance as jest.Mock).mockResolvedValue({
        cancelOrder: jest.fn().mockRejectedValue(
          new CheckoutError(
            'An error occurred while cancelling the order listing',
            CheckoutErrorType.CANCEL_ORDER_LISTING_ERROR,
            {
              orderId: '1',
              message: 'An error occurred while cancelling the order listing',
            },
          ),
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
      expect(data).toEqual({
        orderId: '1',
        message: 'An error occurred while cancelling the order listing',
      });
    });
  });
});
