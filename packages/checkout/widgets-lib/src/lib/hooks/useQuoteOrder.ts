import { useState, useEffect, useRef } from 'react';
import { compareStr } from '../utils';
import {
  OrderQuote,
  OrderQuoteCurrency,
  SaleErrorTypes,
  OrderQuoteApiResponse,
  UseQuoteOrderParams,
  PRIMARY_SALES_API_BASE_URL,
} from '../primary-sales';

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
  data?: Record<string, unknown>;
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

  const setError = (error: unknown) => {
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
        setError(error);
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

        const config = transformToOrderQuote(
          await response.json(),
          preferredCurrency,
        );
        setOrderQuote(config);
      } catch (error) {
        setError(error);
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
