import {
  ExecutedTransaction,
  Item,
  SignApiProduct,
  SignApiResponse,
  SignResponse,
  SignedOrderProduct,
} from '../types';

/**
 * Transform a list of transactions to a string
 * @param transactions list of transactions
 */
export const toStringifyTransactions = (transactions: ExecutedTransaction[]) => transactions
  .map(({ method, hash }) => `${method}: ${hash}`).join(' | ');

/**
 * Transform a string to PascalCase
 * @param str string to be transformed
 * ie: test_string -> TestString
 */
export const toPascalCase = (str: string) => str
  .replace(/[-_]+/g, ' ')
  .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => (index === 0 ? word.toUpperCase() : word.toUpperCase()))
  .replace(/\s+/g, '');

/**
 * Transform the product from the sign api to item form expected by sale widget
 * @param product the product from the sign api
 * @param currency the currency of the order
 * @param item the item to be purchased
 */
export const toSignedProduct = (
  product: SignApiProduct,
  currency: string,
  item?: Item,
): SignedOrderProduct => ({
  productId: product.product_id,
  image: item?.image || '',
  qty: item?.qty || 1,
  name: item?.name || '',
  description: item?.description || '',
  currency,
  collectionAddress: product.detail[0]?.collection_address,
  amount: product.detail.map(({ amount }) => amount),
  tokenId: product.detail.map(({ token_id: tokenId }) => Number(tokenId)),
});

/**
 * Transform the response from the sign api to the format expected by the sale widget
 * @param signApiResponse the response from the sign api
 * @param items list of items to be purchased
 */
export const toSignResponse = (
  signApiResponse: SignApiResponse,
  items: Item[],
): SignResponse => {
  const { order, transactions } = signApiResponse;

  return {
    order: {
      currency: {
        name: order.currency.name,
        erc20Address: order.currency.erc20_address,
      },
      products: order.products
        .map((product) => toSignedProduct(
          product,
          order.currency.name,
          items.find((item) => item.productId === product.product_id),
        ))
        .reduce((acc, product) => {
          const index = acc.findIndex((n) => n.name === product.name);

          if (index === -1) {
            acc.push({ ...product });
          }

          if (index > -1) {
            acc[index].amount = [...acc[index].amount, ...product.amount];
            acc[index].tokenId = [...acc[index].tokenId, ...product.tokenId];
          }

          return acc;
        }, [] as SignedOrderProduct[]),
      totalAmount: Number(order.total_amount),
    },
    transactions: transactions.map((transaction) => ({
      contractAddress: transaction.contract_address,
      gasEstimate: transaction.gas_estimate,
      methodCall: transaction.method_call,
      params: {
        reference: transaction.params.reference || '',
        amount: transaction.params.amount || 0,
        spender: transaction.params.spender || '',
      },
      rawData: transaction.raw_data,
    })),
  };
};
