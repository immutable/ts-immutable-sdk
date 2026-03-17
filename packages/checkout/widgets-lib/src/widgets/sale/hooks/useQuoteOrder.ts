import { useState, useEffect, useRef } from 'react';
import { Environment } from '@imtbl/config';
import { WrappedBrowserProvider, SaleItem } from '@imtbl/checkout-sdk';
import { compareStr, errorToString } from '../../../lib/utils';
import { PRIMARY_SALES_API_BASE_URL } from '../utils/config';

import { OrderQuote, OrderQuoteCurrency, SaleErrorTypes } from '../types';
import { transformToOrderQuote } from '../functions/transformToOrderQuote';

/* eslint-disable @typescript-eslint/naming-convention, max-len */
const MOCK_QUOTE_JSON = {
  config: { contract_id: '0x0000000000000000000000000000000000000000' },
  currencies: [
    {
      base: true,
      decimals: 18,
      erc20_address: '0x0000000000000000000000000000000000000000',
      exchange_id: 'immutable',
      name: 'tIMX',
    },
    {
      base: false,
      decimals: 6,
      erc20_address: '0x3b2d8a1931736fc321c24864bceee981b11c3c57',
      exchange_id: 'usd-coin',
      name: 'USDC',
    },
  ],
  products: {
    kangaroo: {
      pricing: {
        tIMX: { amount: 10, currency: 'tIMX', type: 'crypto' },
        USDC: { amount: 10, currency: 'USDC', type: 'crypto' },
      },
      product_id: 'kangaroo',
      quantity: 1,
    },
    quokka: {
      pricing: {
        tIMX: { amount: 10, currency: 'tIMX', type: 'crypto' },
        USDC: { amount: 10, currency: 'USDC', type: 'crypto' },
      },
      product_id: 'quokka',
      quantity: 1,
    },
    wombat: {
      pricing: {
        tIMX: { amount: 10, currency: 'tIMX', type: 'crypto' },
        USDC: { amount: 10, currency: 'USDC', type: 'crypto' },
      },
      product_id: 'wombat',
      quantity: 1,
    },
    kiwi: {
      pricing: {
        tIMX: { amount: 10, currency: 'tIMX', type: 'crypto' },
        USDC: { amount: 10, currency: 'USDC', type: 'crypto' },
      },
      product_id: 'kiwi',
      quantity: 1,
    },
    emu: {
      pricing: {
        tIMX: { amount: 10, currency: 'tIMX', type: 'crypto' },
        USDC: { amount: 10, currency: 'USDC', type: 'crypto' },
      },
      product_id: 'emu',
      quantity: 1,
    },
    corgi: {
      pricing: {
        tIMX: { amount: 10, currency: 'tIMX', type: 'crypto' },
        USDC: { amount: 10, currency: 'USDC', type: 'crypto' },
      },
      product_id: 'corgi',
      quantity: 1,
    },
    bull: {
      pricing: {
        tIMX: { amount: 10, currency: 'tIMX', type: 'crypto' },
        USDC: { amount: 10, currency: 'USDC', type: 'crypto' },
      },
      product_id: 'bull',
      quantity: 1,
    },
    ibis: {
      pricing: {
        tIMX: { amount: 10, currency: 'tIMX', type: 'crypto' },
        USDC: { amount: 10, currency: 'USDC', type: 'crypto' },
      },
      product_id: 'ibis',
      quantity: 1,
    },
  },
  total_amount: {
    tIMX: { amount: 80, currency: 'tIMX', type: 'crypto' },
    USDC: { amount: 80, currency: 'USDC', type: 'crypto' },
  },
};
/* eslint-enable @typescript-eslint/naming-convention, max-len */

type UseQuoteOrderParams = {
  items: SaleItem[];
  environmentId: string;
  environment: Environment;
  provider: WrappedBrowserProvider | undefined;
  preferredCurrency?: string;
};

export const defaultOrderQuote: OrderQuote = {
  config: {
    contractId: '',
  },
  currencies: [],
  products: {},
  totalAmount: {},
};

export type ConfigError = {
  type: SaleErrorTypes;
  data?: Record<string, string>;
};

export const useQuoteOrder = ({
  items,
  environment,
  environmentId,
  provider,
  preferredCurrency,
}: UseQuoteOrderParams) => {
  const [selectedCurrency, setSelectedCurrency] = useState<
  OrderQuoteCurrency | undefined
  >();
  const fetching = useRef(false);
  const [queryParams, setQueryParams] = useState<string>('');
  const [orderQuote, setOrderQuote] = useState<OrderQuote>(defaultOrderQuote);
  const [orderQuoteError, setOrderQuoteError] = useState<
  ConfigError | undefined
  >(undefined);

  const setError = (error: string) => {
    setOrderQuoteError({
      type: SaleErrorTypes.SERVICE_BREAKDOWN,
      data: { reason: 'Error fetching settlement currencies', error },
    });
  };

  useEffect(() => {
    // Set request params
    if (!items?.length || !provider) return;

    (async () => {
      try {
        const params = new URLSearchParams();
        const products = items.map(({ productId: id, qty }) => ({ id, qty }));
        params.append('products', btoa(JSON.stringify(products)));

        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        params.append('wallet_address', address);

        setQueryParams(params.toString());
      } catch (error) {
        setError(errorToString(error));
      }
    })();
  }, [items, provider]);

  useEffect(() => {
    // Fetch order config
    if (!environment || !environmentId || !queryParams) return;

    (async () => {
      if (fetching.current) return;

      try {
        fetching.current = true;

        // Local dev bypass: ?mockPrimarySales=1 → skip API, use mock
        /* eslint-disable no-underscore-dangle, @typescript-eslint/naming-convention */
        const useMock = typeof window !== 'undefined'
          && (window as Window & { __MOCK_PRIMARY_SALES_QUOTE__?: boolean }).__MOCK_PRIMARY_SALES_QUOTE__;
        /* eslint-enable no-underscore-dangle, @typescript-eslint/naming-convention */
        let json: Record<string, unknown>;
        if (useMock) {
          json = MOCK_QUOTE_JSON;
        } else {
          const baseUrl = `${PRIMARY_SALES_API_BASE_URL[environment]}/${environmentId}/order/quote?${queryParams}`;
          const response = await fetch(baseUrl, {
            method: 'GET',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            headers: { 'Content-Type': 'application/json' },
          });
          if (!response.ok) throw new Error(`${response.status} - ${response.statusText}`);
          json = await response.json();
        }

        const config = transformToOrderQuote(
          json as Parameters<typeof transformToOrderQuote>[0],
          preferredCurrency,
        );
        setOrderQuote(config);
      } catch (error) {
        setError(errorToString(error));
      } finally {
        fetching.current = false;
      }
    })();
  }, [environment, environmentId, queryParams]);

  useEffect(() => {
    // Set default currency
    if (orderQuote.currencies.length === 0) return;

    const baseCurrencyOverride = preferredCurrency
      ? orderQuote.currencies.find((c) => compareStr(c.name, preferredCurrency))
      : undefined;

    const defaultSelectedCurrency = baseCurrencyOverride
      || orderQuote.currencies.find((c) => c.base)
      || orderQuote.currencies?.[0];

    setSelectedCurrency(defaultSelectedCurrency);
  }, [orderQuote]);

  return {
    orderQuote,
    selectedCurrency,
    orderQuoteError,
  };
};
