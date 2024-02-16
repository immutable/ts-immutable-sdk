/* eslint-disable @typescript-eslint/naming-convention */
import { useState, useEffect } from 'react';
import { PRIMARY_SALES_API_BASE_URL } from '../utils/config';

type CurrencyResponse = {
  decimals: number;
  erc20_address: string;
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
  const [currencyResponse, setCurrencyResponse] = useState<
  CurrencyResponse | undefined
  >(undefined);

  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const baseUrl = `${PRIMARY_SALES_API_BASE_URL[env]}/${environmentId}/currency`;
        const response = await fetch(baseUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        let selectedCurrency;
        if (data.currencies && data.currencies.length > 0) {
          if (currencyName) {
            selectedCurrency = data.currencies.find(
              (c: CurrencyResponse) => c.name === currencyName,
            ) || null;
          }
          selectedCurrency = selectedCurrency || data.currencies[0];
          setCurrencyResponse(selectedCurrency);
        }
      } catch (error) {
        setCurrencyResponse(undefined);
      }
    };

    fetchCurrency();
  }, [env, environmentId, currencyName]);

  return { currencyResponse };
};
