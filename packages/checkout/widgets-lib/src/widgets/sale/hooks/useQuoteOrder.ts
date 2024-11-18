import { useState, useEffect, useRef } from 'react';
import { Environment } from '@imtbl/config';
import { NamedBrowserProvider, SaleItem } from '@imtbl/checkout-sdk';
import { compareStr } from '../../../lib/utils';
import { PRIMARY_SALES_API_BASE_URL } from '../utils/config';

import { OrderQuote, OrderQuoteCurrency, SaleErrorTypes } from '../types';
import { transformToOrderQuote } from '../functions/transformToOrderQuote';

type UseQuoteOrderParams = {
  items: SaleItem[];
  environmentId: string;
  environment: Environment;
  provider: NamedBrowserProvider | undefined;
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
  data?: Record<string, unknown>;
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
