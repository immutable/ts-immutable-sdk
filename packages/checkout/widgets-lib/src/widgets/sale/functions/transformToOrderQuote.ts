/* eslint-disable @typescript-eslint/naming-convention */
import { compareStr } from 'lib/utils';
import { OrderQuote } from '../types';

export type OrderQuoteApiResponse = {
  config: {
    contract_id: string;
  };
  currencies: Array<{
    base: boolean;
    decimals: number;
    erc20_address: string;
    exchange_id: string;
    name: string;
  }>;
  products: Record<
  string,
  {
    pricing: Record<
    string,
    {
      amount: number;
      currency: string;
      type: string;
    }
    >;
    product_id: string;
    quantity: number;
  }
  >;
  total_amount: Record<
  string,
  {
    amount: number;
    currency: string;
    type: string;
  }
  >;
};

const transformCurrencies = (
  currencies: OrderQuoteApiResponse['currencies'],
  preferredCurrency?: string,
): OrderQuote['currencies'] => {
  const invalidPreferredCurrency = currencies.findIndex(({ name }) => compareStr(name, preferredCurrency || '')) === -1;

  if (preferredCurrency && invalidPreferredCurrency) {
    // eslint-disable-next-line no-console
    console.warn(
      `[IMTBL]: invalid "preferredCurrency=${preferredCurrency}" widget input`,
    );
  }

  if (preferredCurrency && !invalidPreferredCurrency) {
    return currencies
      .filter(({ name }) => compareStr(name, preferredCurrency))
      .map(({ erc20_address, exchange_id, ...fields }) => ({
        ...fields,
        base: true,
        address: erc20_address,
        exchangeId: exchange_id,
      }));
  }

  return currencies.map(({ erc20_address, exchange_id, ...fields }) => ({
    ...fields,
    address: erc20_address,
    exchangeId: exchange_id,
  }));
};

export const transformToOrderQuote = (
  {
    config, currencies, products, total_amount,
  }: OrderQuoteApiResponse,
  preferredCurrency?: string,
): OrderQuote => ({
  config: {
    contractId: config.contract_id,
  },
  currencies: transformCurrencies(currencies, preferredCurrency),
  products: Object.entries(products).reduce(
    (acc, [productId, { product_id, ...fields }]) => ({
      ...acc,
      [productId]: { productId, ...fields },
    }),
    {},
  ),
  totalAmount: total_amount,
});
