import { Web3Provider } from '@ethersproject/providers';
import { Environment } from '@imtbl/config';
import { OrderStatus } from '@imtbl/orderbook';
import { PopulatedTransaction } from 'ethers';
import { CheckoutConfiguration } from '../../config';
import { CheckoutError, CheckoutErrorType } from '../../errors';
import { cancel } from './cancel';
import { createOrderbookInstance } from '../../instance';

jest.mock('../../instance');

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
        await cancel(config, mockProvider, orderId);
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

    it('should return the unsigned cancel order transaction', async () => {
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

      const result = await cancel(config, mockProvider, orderId);

      expect(result).toEqual({
        unsignedCancelOrderTransaction: {
          to: '0xTO',
          from: '0xFROM',
          nonce: 1,
        } as PopulatedTransaction,
      });
    });
  });
});
