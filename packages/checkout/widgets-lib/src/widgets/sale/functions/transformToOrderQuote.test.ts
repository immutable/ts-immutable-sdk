/* eslint-disable @typescript-eslint/naming-convention */
import { OrderQuote } from '../types';
import {
  OrderQuoteApiResponse,
  transformToOrderQuote,
} from './transformToOrderQuote';

describe('transformToOrderQuote', () => {
  let quoteResponse: OrderQuoteApiResponse;
  let expectedResponse: OrderQuote;

  beforeEach(() => {
    quoteResponse = {
      config: {
        contract_id: '',
      },
      currencies: [
        {
          base: true,
          decimals: 6,
          erc20_address: '0x3b2d8a1931736fc321c24864bceee981b11c3c57',
          exchange_id: 'usd-coin',
          name: 'USDC',
        },
        {
          base: false,
          decimals: 18,
          erc20_address: '0xb8ee289c64c1a0dc0311364721ada8c3180d838c',
          exchange_id: 'guild-of-guardians',
          name: 'GOG',
        },
        {
          base: false,
          decimals: 18,
          erc20_address: '0xe9e96d1aad82562b7588f03f49ad34186f996478',
          exchange_id: 'ethereum',
          name: 'ETH',
        },
      ],
      products: {
        lab: {
          pricing: {
            ETH: {
              amount: 0.00317,
              currency: 'ETH',
              type: 'crypto',
            },
            GOG: {
              amount: 39.84294,
              currency: 'GOG',
              type: 'crypto',
            },
            USD: {
              amount: 9.6096,
              currency: 'USD',
              type: 'fiat',
            },
            USDC: {
              amount: 9.6,
              currency: 'USDC',
              type: 'crypto',
            },
          },
          product_id: 'lab',
          quantity: 1,
        },
      },
      total_amount: {
        ETH: {
          amount: 0.00317,
          currency: 'ETH',
          type: 'crypto',
        },
        GOG: {
          amount: 39.84294,
          currency: 'GOG',
          type: 'crypto',
        },
        USD: {
          amount: 9.6096,
          currency: 'USD',
          type: 'fiat',
        },
        USDC: {
          amount: 9.6,
          currency: 'USDC',
          type: 'crypto',
        },
      },
    };

    expectedResponse = {
      config: {
        contractId: '',
      },
      currencies: [
        {
          base: true,
          decimals: 6,
          address: '0x3b2d8a1931736fc321c24864bceee981b11c3c57',
          exchangeId: 'usd-coin',
          name: 'USDC',
        },
        {
          base: false,
          decimals: 18,
          address: '0xb8ee289c64c1a0dc0311364721ada8c3180d838c',
          exchangeId: 'guild-of-guardians',
          name: 'GOG',
        },
        {
          base: false,
          decimals: 18,
          address: '0xe9e96d1aad82562b7588f03f49ad34186f996478',
          exchangeId: 'ethereum',
          name: 'ETH',
        },
      ],
      products: {
        lab: {
          pricing: {
            ETH: {
              amount: 0.00317,
              currency: 'ETH',
              type: 'crypto',
            },
            GOG: {
              amount: 39.84294,
              currency: 'GOG',
              type: 'crypto',
            },
            USD: {
              amount: 9.6096,
              currency: 'USD',
              type: 'fiat',
            },
            USDC: {
              amount: 9.6,
              currency: 'USDC',
              type: 'crypto',
            },
          },
          productId: 'lab',
          quantity: 1,
        },
      },
      totalAmount: {
        ETH: {
          amount: 0.00317,
          currency: 'ETH',
          type: 'crypto',
        },
        GOG: {
          amount: 39.84294,
          currency: 'GOG',
          type: 'crypto',
        },
        USD: {
          amount: 9.6096,
          currency: 'USD',
          type: 'fiat',
        },
        USDC: {
          amount: 9.6,
          currency: 'USDC',
          type: 'crypto',
        },
      },
    };
  });

  it('should transform response into order quote object', () => {
    expect(transformToOrderQuote(quoteResponse)).toStrictEqual(
      expectedResponse,
    );
  });

  it('should filter currencies by preferred currency (no case sensitive)', () => {
    const result = transformToOrderQuote(quoteResponse, 'goG');
    expect(result.currencies.length).toBe(1);
    expect(result.currencies).toStrictEqual([
      {
        base: true,
        decimals: 18,
        address: '0xb8ee289c64c1a0dc0311364721ada8c3180d838c',
        exchangeId: 'guild-of-guardians',
        name: 'GOG',
      },
    ]);
  });

  it('should not filter if invalid preferred currency', () => {
    expect(transformToOrderQuote(quoteResponse, 'tIMX')).toStrictEqual(
      expectedResponse,
    );
  });
});
