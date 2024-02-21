/* eslint-disable @typescript-eslint/naming-convention */
import { useState, useEffect } from 'react';
import { PRIMARY_SALES_API_BASE_URL } from '../utils/config';

type CurrencyResponse = {
  decimals: number;
  erc20Address: string;
  name: string;
};

type UseCurrencyParams = {
  env: string;
  environmentId: string;
  currencyName?: string;
};

export const useCurrency = ({
  env,
  environmentId,
  currencyName,
}: UseCurrencyParams) => {
  const [currencyResponse, setCurrencyResponse] = useState<CurrencyResponse | undefined
  >(undefined);

  useEffect(() => {
    const fetchCurrency = async () => {
      if (!env || !environmentId) return;

      try {
        const baseUrl = `${PRIMARY_SALES_API_BASE_URL[env]}/${environmentId}/currency`;
        const response = await fetch(baseUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        const selectedCurrency = data.currencies.find((c) => c.name === currencyName) || data.currencies[0];

        const mappedCurrency: CurrencyResponse = {
          ...selectedCurrency,
          erc20Address: selectedCurrency.erc20_address,
        };

        setCurrencyResponse(mappedCurrency);
      } catch (error) {
        setCurrencyResponse(undefined);
      }
    };

    fetchCurrency();
  }, [env, environmentId, currencyName]);

  return { currencyResponse };
};
