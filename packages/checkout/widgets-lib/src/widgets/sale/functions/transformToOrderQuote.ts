/* eslint-disable @typescript-eslint/naming-convention */
import { OrderQuote } from '../types';

export type OrderQuoteApiResponse = {
  config: {
    contract_id: string;
  },
  currencies: Array<{
    base: boolean
    decimals: number
    erc20_address: string
    exchange_id: string
    name: string
  }>
  products: Record<string, {
    pricing: Record<string, {
      amount: number
      currency: string
      type: string
    }>
    product_id: string
    quantity: number
  }>;
  total_amount: Record<string, {
    amount: number
    currency: string
    type: string
  }>
};

export const transformToOrderQuote = (
  {
    config,
    currencies,
    products,
    total_amount,
  }: OrderQuoteApiResponse,
): OrderQuote => ({
  config: {
    contractId: config.contract_id,
  },
  currencies: currencies.map(({ erc20_address, exchange_id, ...fields }) => ({
    ...fields,
    address: erc20_address,
    exchangeId: exchange_id,
  })),
  products: Object.entries(products).reduce((acc, [productId, { product_id, ...fields }]) => ({
    ...acc,
    [productId]: { productId, ...fields },
  }), {}),
  totalAmount: total_amount,
});
