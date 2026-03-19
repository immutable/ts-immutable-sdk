import { useState, useEffect, useRef } from 'react';
import { Environment } from '@imtbl/config';
import { WrappedBrowserProvider, SaleItem } from '@imtbl/checkout-sdk';
import { compareStr, errorToString } from '../../../lib/utils';
import { PRIMARY_SALES_API_BASE_URL } from '../utils/config';

import { OrderQuote, OrderQuoteCurrency, SaleErrorTypes } from '../types';
import { transformToOrderQuote } from '../functions/transformToOrderQuote';

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
  data?: Record<string, unknown>;
};

/**
 * Validates the order quote response before use. Ensures:
 * - Currencies are non-empty (empty usually indicates wrong project config or endpoint).
 * - Products are non-empty.
 * - Every sale item has a matching product in the quote (no missing productIds).
 */
function validateOrderQuote(
  config: OrderQuote,
  items: SaleItem[],
): { valid: true } | { valid: false; reason: string } {
  if (!config.currencies?.length) {
    return { valid: false, reason: 'Quote returned no currencies' };
  }

  const productIds = Object.keys(config.products || {});
  if (productIds.length === 0) {
    return { valid: false, reason: 'Quote returned no products' };
  }

  const missing = items.filter((item) => !config.products![item.productId]);
  if (missing.length > 0) {
    return {
      valid: false,
      reason: `Quote missing products for: ${missing.map((m) => m.productId).join(', ')}`,
    };
  }
  return { valid: true };
}

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

  const setQuoteValidationError = (reason: string) => {
    setOrderQuoteError({
      type: SaleErrorTypes.SERVICE_BREAKDOWN,
      data: { reason: 'Invalid order quote response', error: reason },
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
        const baseUrl = `${PRIMARY_SALES_API_BASE_URL[environment]}/${environmentId}/order/quote?${queryParams}`;

        // eslint-disable-next-line
        const response = await fetch(baseUrl, {
          method: 'GET',
          // eslint-disable-next-line @typescript-eslint/naming-convention
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          if (response.status === 400) {
            const { code, message } = await response.json();
            setOrderQuoteError({
              type: SaleErrorTypes.SALE_AUTHORIZATION_REJECTED,
              data: {
                vendorError: { code: code || '', message: message || undefined },
              },
            });
            return;
          }
          throw new Error(`${response.status} - ${response.statusText}`);
        }

        const config = transformToOrderQuote(
          await response.json(),
          preferredCurrency,
        );

        const validation = validateOrderQuote(config, items);
        if (!validation.valid) {
          setQuoteValidationError(validation.reason);
          return;
        }

        setOrderQuote(config);
      } catch (error) {
        setError(errorToString(error));
      } finally {
        fetching.current = false;
      }
    })();
  }, [environment, environmentId, queryParams, items]);

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
