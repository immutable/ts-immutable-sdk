/* eslint-disable @typescript-eslint/naming-convention */
import { BigNumber } from 'ethers';
import { Environment } from '@imtbl/config';
import { ItemType } from '../types/buy';
import {
  SEAPORT_CONTRACT_ADDRESS, getBuyItem, buy, GAS_LIMIT,
} from './buy';
import { createOrderbookInstance } from '../instance';
import { CheckoutConfiguration } from '../config';
import { CheckoutErrorType } from '../errors';

jest.mock('../instance');

describe('buy', () => {
  describe('buy', () => {
    let config: CheckoutConfiguration;

    beforeEach(() => {
      config = new CheckoutConfiguration({
        baseConfig: { environment: Environment.SANDBOX },
      });
    });

    it('should return type of native and amount', async () => {
      (createOrderbookInstance as jest.Mock).mockResolvedValue({
        getListing: jest.fn().mockResolvedValue({
          result: {
            buy: [
              {
                item_type: 'NATIVE',
                start_amount: '1',
              },
            ],
            fees: [
              {
                amount: '1',
              },
            ],
          },
        }),
      });

      const provider = {} as any;
      const orderId = '1';
      const result = await buy(config, provider, orderId);

      expect(result).toEqual(
        {
          requirements: [
            {
              type: ItemType.NATIVE,
              amount: BigNumber.from('2'),
            },
          ],
          gas: {
            type: 'NATIVE',
            limit: BigNumber.from(GAS_LIMIT),
          },
        },
      );
    });

    it('should return type of erc20 and amount', async () => {
      (createOrderbookInstance as jest.Mock).mockResolvedValue({
        getListing: jest.fn().mockResolvedValue({
          result: {
            buy: [
              {
                item_type: 'ERC20',
                start_amount: '1',
                contract_address: '0x123',
              },
            ],
            fees: [
              {
                amount: '1',
              },
            ],
          },
        }),
      });

      const provider = {} as any;
      const orderId = '1';
      const result = await buy(config, provider, orderId);

      expect(result).toEqual(
        {
          requirements: [
            {
              type: ItemType.ERC20,
              amount: BigNumber.from('2'),
              contractAddress: '0x123',
              approvalContractAddress: SEAPORT_CONTRACT_ADDRESS,
            },
          ],
          gas: {
            type: 'NATIVE',
            limit: BigNumber.from(GAS_LIMIT),
          },
        },
      );
    });

    it('should return type of erc721 and amount', async () => {
      (createOrderbookInstance as jest.Mock).mockResolvedValue({
        getListing: jest.fn().mockResolvedValue({
          result: {
            buy: [
              {
                item_type: 'ERC721',
                start_amount: '1',
                contract_address: '0x123',
              },
            ],
            fees: [
              {
                amount: '1',
              },
            ],
          },
        }),
      });

      const provider = {} as any;
      const orderId = '1';
      const result = await buy(config, provider, orderId);

      expect(result).toEqual(
        {
          requirements: [
            {
              type: ItemType.ERC721,
              amount: BigNumber.from('2'),
              contractAddress: '0x123',
              approvalContractAddress: SEAPORT_CONTRACT_ADDRESS,
            },
          ],
          gas: {
            type: 'NATIVE',
            limit: BigNumber.from(GAS_LIMIT),
          },
        },
      );
    });

    it('should throw error if orderbook returns unsupported item type', async () => {
      (createOrderbookInstance as jest.Mock).mockResolvedValue({
        getListing: jest.fn().mockResolvedValue({
          result: {
            buy: [
              {
                item_type: 'UNSUPPORTED',
                start_amount: '1',
              },
            ],
            fees: [
              {
                amount: '1',
              },
            ],
          },
        }),
      });

      const provider = {} as any;
      const orderId = '1';

      try {
        await buy(config, provider, orderId);
      } catch (err: any) {
        expect(err.message).toEqual('Purchasing token type is unsupported');
        expect(err.type).toEqual(CheckoutErrorType.UNSUPPORTED_TOKEN_TYPE_ERROR);
        expect(err.data).toEqual({ orderId: '1' });
      }
    });

    it('should throw error if orderbook returns error', async () => {
      (createOrderbookInstance as jest.Mock).mockResolvedValue({
        getListing: jest.fn().mockRejectedValue(new Error('error from orderbook')),
      });

      const provider = {} as any;
      const orderId = '1';

      try {
        await buy(config, provider, orderId);
      } catch (err: any) {
        expect(err.message).toEqual('An error occurred while getting the order listing');
        expect(err.type).toEqual(CheckoutErrorType.GET_ORDER_LISTING_ERROR);
        expect(err.data).toEqual({
          orderId: '1',
          message: 'error from orderbook',
        });
      }
    });
  });

  describe('getBuyItem', () => {
    it('should return type of native and amount', () => {
      const type = ItemType.NATIVE;
      const amount = BigNumber.from('1');
      const contractAddress = '';
      const result = getBuyItem(type, amount, contractAddress);
      expect(result).toEqual({
        type,
        amount,
      });
    });

    it('should return type of erc20 and amount', () => {
      const type = ItemType.ERC20;
      const amount = BigNumber.from('1');
      const contractAddress = '0x123';
      const result = getBuyItem(type, amount, contractAddress);
      expect(result).toEqual({
        type,
        amount,
        contractAddress,
        approvalContractAddress: SEAPORT_CONTRACT_ADDRESS,
      });
    });

    it('should return type of erc721 and amount', () => {
      const type = ItemType.ERC721;
      const amount = BigNumber.from('1');
      const contractAddress = '0x123';
      const result = getBuyItem(type, amount, contractAddress);
      expect(result).toEqual({
        type,
        amount,
        contractAddress,
        approvalContractAddress: SEAPORT_CONTRACT_ADDRESS,
      });
    });

    it('should return type of native and amount for default case', () => {
      const amount = BigNumber.from('1');
      const contractAddress = '';
      const result = getBuyItem('default' as ItemType, amount, contractAddress);
      expect(result).toEqual({
        type: ItemType.NATIVE,
        amount,
      });
    });
  });
});
