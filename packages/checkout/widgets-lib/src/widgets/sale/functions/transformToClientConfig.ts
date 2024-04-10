/* eslint-disable @typescript-eslint/naming-convention */
import {
  ClientConfig,
  ClientConfigCurrencyConversion,
  SignPaymentTypes,
} from '../types';

export type ClientConfigResponse = {
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

export const transformToClientConfig = (
  response: ClientConfigResponse,
): ClientConfig => ({
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
