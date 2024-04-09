/* eslint-disable @typescript-eslint/naming-convention */
import { useState, useEffect } from 'react';
import { Passport } from '@imtbl/passport';

import { Environment } from '@imtbl/config';
import { TokenFilterTypes } from '@imtbl/checkout-sdk';
import { providers } from 'ethers';
import { PRIMARY_SALES_API_BASE_URL } from '../utils/config';

import {
  ClientConfig,
  ClientConfigCurrency,
  ClientConfigCurrencyConversion,
  SaleWidgetCurrency,
  SaleWidgetCurrencyType,
  SignPaymentTypes,
} from '../types';
import { useCheckoutClient } from './useCheckoutClient';
import { sortCurrencies } from '../utils/sortCurrencies';

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
  currencyConversion: Object.entries(response.currency_conversion).reduce(
    (acc, [key, value]) => {
      acc[key] = {
        amount: value.amount,
        name: value.name,
        type: value.type as SignPaymentTypes,
      };
      return acc;
    },
    {} as ClientConfigCurrencyConversion,
  ),
});

type UseClientConfigParams = {
  environment: Environment;
  environmentId: string;
  passport: Passport | undefined;
  defaultCurrency?: string;
};

export const defaultClientConfig: ClientConfig = {
  contractId: '',
  currencies: [],
  currencyConversion: {},
};

export const useCurrency = ({
  environment,
  environmentId,
  passport,
  defaultCurrency,
}: UseClientConfigParams) => {
  const [selectedCurrency, setSelectedCurrency] = useState<
  ClientConfigCurrency | undefined
  >();
  const [clientConfig, setClientConfig] = useState<ClientConfig>(defaultClientConfig);
  const [allCurrencies, setAllCurrencies] = useState<SaleWidgetCurrency[]>([]);

  const checkoutClient = useCheckoutClient({ passport, environment });

  useEffect(() => {
    if (!environment || !environmentId) return;

    const fetchSwappableCurrencies = async () => {
      if (!checkoutClient || !passport) {
        return [];
      }
      try {
        const passportProvider = passport.connectEvm();
        const zkEvmProvider = new providers.Web3Provider(passportProvider);
        const checkoutNetworkInfo = await checkoutClient.getNetworkInfo({
          provider: zkEvmProvider,
        });
        const swapAllowList = await checkoutClient.getTokenAllowList({
          type: TokenFilterTypes.SWAP,
          chainId: checkoutNetworkInfo.chainId,
        });

        return swapAllowList.tokens.map((token) => ({
          ...token,
          currencyType: SaleWidgetCurrencyType.SWAPPABLE,
        }));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching swappable currencies:', error);
        return [];
      }
    };

    const fetchSettlementCurrencies = async () => {
      try {
        const baseUrl = `${PRIMARY_SALES_API_BASE_URL[environment]}/${environmentId}/client-config`;
        const response = await fetch(baseUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error(`${response.status} - ${response.statusText}`);

        const data: ClientConfigResponse = await response.json();
        const config = toClientConfig(data);
        setClientConfig(config);

        return config.currencies.map((currency) => ({
          ...currency,
          currencyType: SaleWidgetCurrencyType.SETTLEMENT,
        }));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching settlement currencies:', error);
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

      const sortedCurrencies = sortCurrencies(combinedCurrencies);
      setAllCurrencies(sortedCurrencies);
    })();
  }, [environment, environmentId, checkoutClient, passport]);

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
  };
};
