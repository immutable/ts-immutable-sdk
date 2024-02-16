import { useState, useCallback } from 'react';
import { PRIMARY_SALES_API_BASE_URL } from '../utils/config';

type CurrencyResponse = {
  decimals: number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  erc20_address: string;
  name: string;
};

export const useCurrency = ({
  env,
  environmentId,
}: {
  env: string;
  environmentId: string;
}) => {
  const [currencyError, setCurrencyError] = useState<Error | undefined>(
    undefined,
  );
  const [currencyResponse, setCurrencyResponse] = useState<
  CurrencyResponse[] | undefined
  >(undefined);

  const fetchCurrency = useCallback(async () => {
    setCurrencyError(undefined);

    try {
      const baseUrl = `${PRIMARY_SALES_API_BASE_URL[env]}/${environmentId}/currency`;
      const response = await fetch(baseUrl, {
        method: 'GET',
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!data) {
        throw new Error('Failed to fetch currency');
      }
      setCurrencyResponse(data.currencies);

      return data.currencies;
    } catch (error) {
      setCurrencyError(error as Error);
    }

    return undefined;
  }, []);

  return { fetchCurrency, currencyResponse, currencyError };
};
