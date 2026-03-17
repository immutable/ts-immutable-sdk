import { useRef, useCallback } from 'react';
import { PurchaseItem } from '@imtbl/checkout-sdk';
import { compareStr } from '../utils';
import {
  OrderQuote,
  OrderQuoteApiResponse,
  UseQuoteOrderParams,
  PRIMARY_SALES_API_BASE_URL,
  OrderQuoteResponse,
} from '../primary-sales';

export const defaultOrderQuote: OrderQuote = {
  config: {
    contractId: '',
  },
  currencies: [],
  products: {},
  totalAmount: {},
};

/* Local dev bypass: window.__MOCK_PRIMARY_SALES_QUOTE__ → skip API */
/* eslint-disable @typescript-eslint/naming-convention, max-len, object-curly-newline */
const MOCK_QUOTE_JSON: OrderQuoteApiResponse = {
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
  },
  total_amount: {
    tIMX: { amount: 10, currency: 'tIMX', type: 'crypto' },
    USDC: { amount: 10, currency: 'USDC', type: 'crypto' },
  },
};
/* eslint-enable @typescript-eslint/naming-convention, max-len, object-curly-newline */

/* eslint-disable @typescript-eslint/naming-convention */
const transformCurrencies = (
  currencies: OrderQuoteApiResponse['currencies'],
  preferredCurrency?: string,
): OrderQuote['currencies'] => {
  const invalidPreferredCurrency = currencies.findIndex(({ name }) => compareStr(name, preferredCurrency || '')) === -1;

  if (preferredCurrency && invalidPreferredCurrency) {
    // eslint-disable-next-line no-console
    console.warn(
      `[IMTBL]: invalid "preferredCurrency=${preferredCurrency}" widget input`,
    );
  }

  if (preferredCurrency && !invalidPreferredCurrency) {
    return currencies
      .filter(({ name }) => compareStr(name, preferredCurrency))
      .map(({ erc20_address, exchange_id, ...fields }) => ({
        ...fields,
        base: true,
        address: erc20_address,
        exchangeId: exchange_id,
      }));
  }

  return currencies.map(({ erc20_address, exchange_id, ...fields }) => ({
    ...fields,
    address: erc20_address,
    exchangeId: exchange_id,
  }));
};

export const transformToOrderQuote = (
  {
    config, currencies, products, total_amount,
  }: OrderQuoteApiResponse,
  preferredCurrency?: string,
): OrderQuote => ({
  config: {
    contractId: config.contract_id,
  },
  currencies: transformCurrencies(currencies, preferredCurrency),
  products: Object.entries(products).reduce(
    (acc, [productId, { product_id, ...fields }]) => ({
      ...acc,
      [productId]: { productId, ...fields },
    }),
    {},
  ),
  totalAmount: total_amount,
});
/* eslint-enable @typescript-eslint/naming-convention */

export const useQuoteOrder = ({
  environment,
  environmentId,
  preferredCurrency,
}: UseQuoteOrderParams) => {
  const fetching = useRef(false);

  const buildQueryParams = (items: PurchaseItem[], walletAddress?: string): string | undefined => {
    const params = new URLSearchParams();
    const products = items.map(({ productId: id, qty }) => ({ id, qty }));
    params.append('products', btoa(JSON.stringify(products)));

    if (walletAddress) {
      params.append('wallet_address', walletAddress);
    }

    return params.toString();
  };

  const getSelectedCurrency = useCallback((orderQuote: OrderQuote) => {
    if (orderQuote.currencies.length === 0) return undefined;

    const baseCurrencyOverride = preferredCurrency
      ? orderQuote.currencies.find((c) => compareStr(c.name, preferredCurrency))
      : undefined;

    return baseCurrencyOverride
      || orderQuote.currencies.find((c) => c.base)
      || orderQuote.currencies?.[0];
  }, [preferredCurrency]);

  const fetchOrderQuote = useCallback(
    async (items: PurchaseItem[], walletAddress?: string): Promise<OrderQuoteResponse | undefined> => {
      // Fetch order config
      if (!environment || !environmentId || !items?.length) return undefined;

      const queryParams = buildQueryParams(items, walletAddress);

      if (fetching.current) return undefined;

      try {
        fetching.current = true;

        /* eslint-disable no-underscore-dangle, @typescript-eslint/naming-convention */
        const useMock = typeof window !== 'undefined'
          && (window as Window & { __MOCK_PRIMARY_SALES_QUOTE__?: boolean }).__MOCK_PRIMARY_SALES_QUOTE__;
        /* eslint-enable no-underscore-dangle, @typescript-eslint/naming-convention */
        let json: OrderQuoteApiResponse;
        if (useMock) {
          json = MOCK_QUOTE_JSON;
        } else {
          const response = await fetch(
            `${PRIMARY_SALES_API_BASE_URL[environment]}/${environmentId}/order/quote?${queryParams}`,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            { method: 'GET', headers: { 'Content-Type': 'application/json' } },
          );
          if (!response.ok) throw new Error(`${response.status} - ${response.statusText}`);
          json = await response.json();
        }

        const quote = transformToOrderQuote(json, preferredCurrency);

        const currency = getSelectedCurrency(quote);

        if (!currency) return undefined;

        return {
          quote,
          currency,
          totalCurrencyAmount: quote.totalAmount[currency.name].amount,
        };
      } finally {
        fetching.current = false;
      }
    },
    [environment, environmentId, preferredCurrency, fetching],
  );

  return {
    fetchOrderQuote,
    getSelectedCurrency,
  };
};
