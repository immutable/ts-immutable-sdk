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
        const baseUrl = `${PRIMARY_SALES_API_BASE_URL[environment]}/${environmentId}/order/quote?${queryParams}`;

        // eslint-disable-next-line
        const response = await fetch(baseUrl, {
          method: 'GET',
          // eslint-disable-next-line @typescript-eslint/naming-convention
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`${response.status} - ${response.statusText}`);
        }

        const quote = transformToOrderQuote(
          await response.json(),
          preferredCurrency,
        );

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
