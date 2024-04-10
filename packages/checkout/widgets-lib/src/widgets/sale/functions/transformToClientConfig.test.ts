/* eslint-disable @typescript-eslint/naming-convention */
import { ClientConfig, SignPaymentTypes } from '../types';
import {
  ClientConfigResponse,
  transformToClientConfig,
} from './transformToClientConfig';

describe('transformToClientConfig', () => {
  it('transformToClientConfig', () => {
    const fromClientConfig: ClientConfigResponse = {
      contract_id: '65696ef06c55501aab4da5e7',
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
      currency_conversion: {
        ETH: {
          amount: 0.000284,
          name: 'ETH',
          type: 'crypto',
        },
        GOG: {
          amount: 6.00203,
          name: 'GOG',
          type: 'crypto',
        },
        USD: {
          amount: 0.999392,
          name: 'USD',
          type: 'fiat',
        },
        USDC: {
          amount: 1,
          name: 'USDC',
          type: 'crypto',
        },
      },
    };

    const toClientConfig: ClientConfig = {
      contractId: '65696ef06c55501aab4da5e7',
      currencies: [
        {
          base: true,
          decimals: 6,
          name: 'USDC',
          erc20Address: '0x3b2d8a1931736fc321c24864bceee981b11c3c57',
          exchangeId: 'usd-coin',
        },
        {
          base: false,
          decimals: 18,
          name: 'GOG',
          erc20Address: '0xb8ee289c64c1a0dc0311364721ada8c3180d838c',
          exchangeId: 'guild-of-guardians',
        },
        {
          base: false,
          decimals: 18,
          name: 'ETH',
          erc20Address: '0xe9e96d1aad82562b7588f03f49ad34186f996478',
          exchangeId: 'ethereum',
        },
      ],
      currencyConversion: {
        ETH: {
          amount: 0.000284,
          name: 'ETH',
          type: SignPaymentTypes.CRYPTO,
        },
        GOG: {
          amount: 6.00203,
          name: 'GOG',
          type: SignPaymentTypes.CRYPTO,
        },
        USD: {
          amount: 0.999392,
          name: 'USD',
          type: SignPaymentTypes.FIAT,
        },
        USDC: {
          amount: 1,
          name: 'USDC',
          type: SignPaymentTypes.CRYPTO,
        },
      },
    };

    expect(transformToClientConfig(fromClientConfig)).toStrictEqual(
      toClientConfig,
    );
  });
});
