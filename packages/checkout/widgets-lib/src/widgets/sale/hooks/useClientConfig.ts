import { useState, useEffect, useRef } from 'react';
import { Environment } from '@imtbl/config';
import { PRIMARY_SALES_API_BASE_URL } from '../utils/config';

import { ClientConfig, ClientConfigCurrency, SaleErrorTypes } from '../types';
import {
  ClientConfigResponse,
  transformToClientConfig,
} from '../functions/transformToClientConfig';

type UseClientConfigParams = {
  amount: string;
  environment: Environment;
  environmentId: string;
};

export const defaultClientConfig: ClientConfig = {
  contractId: '',
  currencies: [],
  currencyConversion: {},
};

export type ConfigError = {
  type: SaleErrorTypes;
  data?: Record<string, unknown>;
};

export const useClientConfig = ({
  amount,
  environment,
  environmentId,
}: UseClientConfigParams) => {
  const [selectedCurrency, setSelectedCurrency] = useState<
  ClientConfigCurrency | undefined
  >();
  const fetching = useRef(false);
  const [clientConfig, setClientConfig] = useState<ClientConfig>(defaultClientConfig);
  const [clientConfigError, setClientConfigError] = useState<
  ConfigError | undefined
  >(undefined);

  useEffect(() => {
    if (!environment || !environmentId || !amount) return;

    (async () => {
      if (fetching.current) return;

      try {
        fetching.current = true;
        const baseUrl = `${PRIMARY_SALES_API_BASE_URL[environment]}/${environmentId}/client-config?amount=${amount}`;
        const response = await fetch(baseUrl, {
          method: 'GET',
          // eslint-disable-next-line @typescript-eslint/naming-convention
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`${response.status} - ${response.statusText}`);
        }

        const data: ClientConfigResponse = await response.json();
        const config = transformToClientConfig(data);
        setClientConfig(config);
      } catch (error) {
        setClientConfigError({
          type: SaleErrorTypes.DEFAULT,
          data: { reason: 'Error fetching settlement currencies' },
        });
      } finally {
        fetching.current = false;
      }
    })();
  }, [environment, environmentId, amount]);

  useEffect(() => {
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
