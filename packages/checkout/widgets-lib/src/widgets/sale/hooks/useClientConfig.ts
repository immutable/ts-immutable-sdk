/* eslint-disable @typescript-eslint/naming-convention */
import { useState, useEffect } from 'react';
import { PRIMARY_SALES_API_BASE_URL } from '../utils/config';
import {
  ClientConfig, ClientConfigCurrency, ClientConfigCurrencyConversion, SignPaymentTypes,
} from '../types';

type ClientConfigResponse = {
  contract_id: string;
  currencies: {
    base: boolean;
    decimals: number;
    erc20_address: string;
    exchange_id: string;
    name: string;
  }[];
  currency_conversion: {
    [key: string]: {
      amount: number;
      name: string;
      type: string;
    };
  };
};

const toClientConfig = (response: ClientConfigResponse): ClientConfig => ({
  contractId: response.contract_id,
  currencies: response.currencies.map((c) => ({
    ...c,
    erc20Address: c.erc20_address,
    exchangeId: c.exchange_id,
  })),
  currencyConversion: Object.entries(response.currency_conversion).reduce((acc, [key, value]) => {
    acc[key] = {
      amount: value.amount,
      name: value.name,
      type: value.type as SignPaymentTypes,
    };
    return acc;
  }, {} as ClientConfigCurrencyConversion),
});

type UseClientConfigParams = {
  environment: string;
  environmentId: string;
  defaultCurrency?: 'USDC';
};

export const defaultClientConfig: ClientConfig = {
  contractId: '',
  currencies: [],
  currencyConversion: {},
};

export const useClientConfig = ({
  environment,
  environmentId,
  defaultCurrency,
}: UseClientConfigParams) => {
  const [currency, setCurrency] = useState<ClientConfigCurrency | undefined>();
  const [clientConfig, setClientConfig] = useState<ClientConfig>(defaultClientConfig);

  useEffect(() => {
    if (!environment || !environmentId) return;

    (async () => {
      const baseUrl = `${PRIMARY_SALES_API_BASE_URL[environment]}/${environmentId}/client-config`;

      try {
        const response = await fetch(baseUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`${response.status} - ${response.statusText}`);
        }

        const data: ClientConfigResponse = await response.json();

        setClientConfig(toClientConfig(data));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('Error fetching client config', error);
      }
    })();
  }, [environment, environmentId]);

  useEffect(() => {
    if (clientConfig.currencies.length === 0) return;

    const selectedCurrency = clientConfig.currencies.find((c) => c.name === defaultCurrency)
      || clientConfig.currencies.find((c) => c.base === true);
    setCurrency(selectedCurrency);
  }, [defaultCurrency, clientConfig]);

  return {
    clientConfig,
    currency,
  };
};
