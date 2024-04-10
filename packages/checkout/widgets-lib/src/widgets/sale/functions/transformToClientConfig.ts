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
  currencies: response.currencies.map(
    ({ erc20_address, exchange_id, ...rest }) => ({
      ...rest,
      erc20Address: erc20_address,
      exchangeId: exchange_id,
    }),
  ),
  currencyConversion: Object.entries(response.currency_conversion).reduce(
    (acc, [key, { amount, name, type }]) => {
      acc[key] = {
        amount,
        name,
        type: type as SignPaymentTypes,
      };
      return acc;
    },
    {} as ClientConfigCurrencyConversion,
  ),
});
