import { useState, useEffect, useRef } from 'react';
import { Environment } from '@imtbl/config';
import { SaleItem } from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import { PRIMARY_SALES_API_BASE_URL } from '../utils/config';

import { ClientConfig, ClientConfigCurrency, SaleErrorTypes } from '../types';
import { transformToClientConfig } from '../functions/transformToClientConfig';

type UseClientConfigParams = {
  items: SaleItem[];
  environmentId: string;
  environment: Environment;
  provider: Web3Provider | undefined;
};

export const defaultClientConfig: ClientConfig = {
  contractId: '',
  currencies: [],
  products: {},
  totalAmount: {},
};

export type ConfigError = {
  type: SaleErrorTypes;
  data?: Record<string, unknown>;
};

export const useClientConfig = ({
  items,
  environment,
  environmentId,
  provider,
}: UseClientConfigParams) => {
  const [selectedCurrency, setSelectedCurrency] = useState<
  ClientConfigCurrency | undefined
  >();
  const fetching = useRef(false);
  const [queryParams, setQueryParams] = useState<string>('');
  const [clientConfig, setClientConfig] = useState<ClientConfig>(defaultClientConfig);
  const [clientConfigError, setClientConfigError] = useState<
  ConfigError | undefined
  >(undefined);

  const setError = (error: unknown) => {
    setClientConfigError({
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

        const signer = provider.getSigner();
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
        const baseUrl = `${PRIMARY_SALES_API_BASE_URL[environment]}/${environmentId}/client-config?${queryParams}`;

        // eslint-disable-next-line
        const response = await fetch(baseUrl, {
          method: 'GET',
          // eslint-disable-next-line @typescript-eslint/naming-convention
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`${response.status} - ${response.statusText}`);
        }

        const config = transformToClientConfig(await response.json());
        setClientConfig(config);
      } catch (error) {
        setError(error);
      } finally {
        fetching.current = false;
      }
    })();
  }, [environment, environmentId, queryParams]);

  useEffect(() => {
    // Set default currency
    if (clientConfig.currencies.length === 0) return;

    const defaultSelectedCurrency = clientConfig.currencies.find((c) => c.base)
      || clientConfig.currencies?.[0];

    setSelectedCurrency(defaultSelectedCurrency);
  }, [clientConfig]);

  return {
    clientConfig,
    selectedCurrency,
    clientConfigError,
  };
};
