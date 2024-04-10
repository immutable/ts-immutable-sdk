import { useState, useEffect } from 'react';

import { Environment } from '@imtbl/config';
import { Checkout, TokenFilterTypes } from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import { PRIMARY_SALES_API_BASE_URL } from '../utils/config';

import {
  ClientConfig,
  ClientConfigCurrency,
  SaleErrorTypes,
  SaleWidgetCurrency,
  SaleWidgetCurrencyType,
} from '../types';
import { sortAndDeduplicateCurrencies } from '../functions/sortAndDeduplicateCurrencies';
import {
  ClientConfigResponse,
  transformToClientConfig,
} from '../functions/transformToClientConfig';

type UseClientConfigParams = {
  environment: Environment;
  environmentId: string;
  checkout: Checkout | undefined;
  provider: Web3Provider | undefined;
  defaultCurrency?: string;
};

export const defaultClientConfig: ClientConfig = {
  contractId: '',
  currencies: [],
  currencyConversion: {},
};

export type ClientConfigError = {
  type: SaleErrorTypes;
  data?: Record<string, unknown>;
};

export const useClientConfig = ({
  environment,
  environmentId,
  checkout,
  provider,
  defaultCurrency,
}: UseClientConfigParams) => {
  const [selectedCurrency, setSelectedCurrency] = useState<
  ClientConfigCurrency | undefined
  >();
  const [clientConfig, setClientConfig] = useState<ClientConfig>(defaultClientConfig);
  const [clientConfigError, setClientConfigError] = useState<
  ClientConfigError | undefined
  >(undefined);
  const [checkoutError, setCheckoutError] = useState<
  ClientConfigError | undefined
  >(undefined);
  const [allCurrencies, setAllCurrencies] = useState<SaleWidgetCurrency[]>([]);

  useEffect(() => {
    if (!environment || !environmentId) return;

    const fetchSwappableCurrencies = async () => {
      if (!checkout || !provider) {
        return [];
      }
      try {
        const checkoutNetworkInfo = await checkout.getNetworkInfo({
          provider,
        });
        const swapAllowList = await checkout.getTokenAllowList({
          type: TokenFilterTypes.SWAP,
          chainId: checkoutNetworkInfo.chainId,
        });

        return swapAllowList.tokens.map((token) => ({
          ...token,
          currencyType: SaleWidgetCurrencyType.SWAPPABLE,
        }));
      } catch (error) {
        // eslint-disable-next-line no-console
        setCheckoutError({
          type: SaleErrorTypes.DEFAULT,
          data: { reason: 'Error fetching swappable currencies' },
        });
        return [];
      }
    };

    const fetchSettlementCurrencies = async () => {
      try {
        const baseUrl = `${PRIMARY_SALES_API_BASE_URL[environment]}/${environmentId}/client-config`;
        const response = await fetch(baseUrl, {
          method: 'GET',
          // eslint-disable-next-line @typescript-eslint/naming-convention
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error(`${response.status} - ${response.statusText}`);

        const data: ClientConfigResponse = await response.json();
        const config = transformToClientConfig(data);
        setClientConfig(config);

        return config.currencies.map((currency) => ({
          ...currency,
          currencyType: SaleWidgetCurrencyType.SETTLEMENT,
        }));
      } catch (error) {
        // eslint-disable-next-line no-console
        setClientConfigError({
          type: SaleErrorTypes.DEFAULT,
          data: { reason: 'Error fetching settlement currencies' },
        });
        return [];
      }
    };

    (async () => {
      const [swappableCurrencies, settlementCurrencies] = await Promise.all([
        fetchSwappableCurrencies(),
        fetchSettlementCurrencies(),
      ]);

      const combinedCurrencies: SaleWidgetCurrency[] = [
        ...settlementCurrencies,
        ...swappableCurrencies,
      ];

      const transformedCurrencies = sortAndDeduplicateCurrencies(combinedCurrencies);
      setAllCurrencies(transformedCurrencies);
    })();
  }, [environment, environmentId, checkout, provider]);

  useEffect(() => {
    if (clientConfig.currencies.length === 0) return;

    const selectedSettlementCurrency = clientConfig.currencies.find((c) => c.name === defaultCurrency)
      || clientConfig.currencies.find((c) => c.base);
    setSelectedCurrency(selectedSettlementCurrency);
  }, [defaultCurrency, clientConfig]);

  return {
    clientConfig,
    selectedCurrency,
    setSelectedCurrency,
    allCurrencies,
    clientConfigError,
    checkoutError,
  };
};
